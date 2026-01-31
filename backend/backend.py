import os
import threading
import time
import tempfile
import glob
import sys
from queue import Queue
from collections import deque
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from yt_dlp import YoutubeDL
from yt_dlp.networking.impersonate import ImpersonateTarget
import shutil
import subprocess
import json
import logging
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Custom log storage
log_messages = deque(maxlen=500)  # Store last 500 log messages
log_lock = threading.Lock()

class WebLogHandler(logging.Handler):
    """Custom handler to store logs in memory for web viewing"""
    def emit(self, record):
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S'),
            'level': record.levelname,
            'message': self.format(record)
        }
        with log_lock:
            log_messages.append(log_entry)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        WebLogHandler()
    ]
)
logger = logging.getLogger(__name__)

# Also reduce Flask's default logging noise for cleaner output
werkzeug_log = logging.getLogger('werkzeug')
werkzeug_log.setLevel(logging.WARNING)

# Use temp directory instead of project folder - files will be served to users and cleaned up
DOWNLOAD_FOLDER = tempfile.mkdtemp(prefix="video_downloader_")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
logger.info(f"✓ Temporary download folder: {DOWNLOAD_FOLDER}")

def detect_ffmpeg():
    # Check if ffmpeg exists in PATH
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        logger.info(f"✓ FFmpeg detected at {ffmpeg_path}")
        return ffmpeg_path
    
    # fallback: try running ffmpeg
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            timeout=5
        )
        if result.returncode == 0:
            logger.info("✓ FFmpeg available")
            return "ffmpeg"
    except Exception as e:
        logger.warning(f"FFmpeg check failed: {e}")

    logger.warning("⚠ FFmpeg not found!")
    return None

FFMPEG_PATH = detect_ffmpeg()
MAX_CONCURRENT = 1

downloads = {
    "total": 0,
    "completed": 0,
    "downloading": 0,
    "queue": []
}
next_id = 1
task_queue = Queue()
state_lock = threading.Lock()

# SSE client management
sse_clients = []
sse_lock = threading.Lock()

def broadcast_update():
    """Send update to all connected SSE clients"""
    with state_lock:
        data = json.dumps(downloads)
    
    with sse_lock:
        for client_queue in sse_clients[:]:
            try:
                client_queue.put(data)
            except:
                if client_queue in sse_clients:
                    sse_clients.remove(client_queue)

def ydl_options(progress_cb):
    opts = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'progress_hooks': [progress_cb],
        'restrictfilenames': True,
        'windowsfilenames': True,
        'updatetime': False,
        'nocheckcertificate': True,
        'buffersize': 1024 * 64,
        'continuedl': True,
        'no_color': True,
        'quiet': False,
        'no_warnings': False,
    }
    
    if FFMPEG_PATH:
        opts['format'] = 'bestvideo+bestaudio/best'
        opts['merge_output_format'] = 'mp4'
        logger.info("Using format: bestvideo+bestaudio/best")
    else:
        logger.warning("⚠ FFmpeg not available - downloading single format only")
        opts['format'] = 'best'

    try:
        opts['impersonate'] = ImpersonateTarget.from_str('chrome')
        logger.info("✓ Using browser impersonation (Chrome)")
    except Exception as e:
        logger.warning(f"Browser impersonation failed: {e}")
        opts['http_headers'] = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }

    return opts

def download_one(item):
    downloaded_filename = None
    logger.info(f"[Item {item['id']}] Starting download for: {item['url']}")
    
    def progress_hook(d):
        try:
            if d['status'] == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate')
                if total:
                    pct = d.get('downloaded_bytes', 0) * 100.0 / total
                    with state_lock:
                        item['progress'] = max(0.0, min(100.0, pct))
                        item['status'] = 'Downloading'
                    broadcast_update()
                    # Log every 10% progress
                    if int(pct) % 10 == 0 and int(pct) > 0:
                        logger.info(f"[Item {item['id']}] Download progress: {int(pct)}%")
            elif d['status'] == 'finished':
                with state_lock:
                    item['progress'] = 100.0
                    item['status'] = 'Merging'
                broadcast_update()
                if 'filename' in d:
                    nonlocal downloaded_filename
                    downloaded_filename = d['filename']
                    logger.info(f"[Item {item['id']}] Download finished: {os.path.basename(downloaded_filename)}")
        except Exception as e:
            logger.error(f"[Item {item['id']}] Progress hook error: {e}")

    opts = ydl_options(progress_hook)
    try:
        logger.info(f"[Item {item['id']}] Creating YoutubeDL instance")
        with YoutubeDL(opts) as ydl:
            logger.info(f"[Item {item['id']}] Extracting video info...")
            info = ydl.extract_info(item['url'], download=False)
            expected_filename = ydl.prepare_filename(info)
            
            # Log video details
            title = info.get('title', 'Unknown')
            duration = info.get('duration', 0)
            filesize = info.get('filesize', info.get('filesize_approx', 0))
            logger.info(f"[Item {item['id']}] Video: '{title}' | Duration: {duration}s | Size: ~{filesize/(1024*1024):.1f}MB")
            logger.info(f"[Item {item['id']}] Expected filename: {os.path.basename(expected_filename)}")
            
            logger.info(f"[Item {item['id']}] Starting actual download...")
            ydl.download([item['url']])
        
        # Find the downloaded file
        if os.path.exists(expected_filename):
            downloaded_filename = expected_filename
        else:
            files = glob.glob(os.path.join(DOWNLOAD_FOLDER, '*'))
            if files:
                downloaded_filename = max(files, key=os.path.getmtime)
        
        if downloaded_filename:
            file_size = os.path.getsize(downloaded_filename) / (1024 * 1024)  # MB
            logger.info(f"[Item {item['id']}] ✓ Download completed successfully!")
            logger.info(f"[Item {item['id']}] File: {os.path.basename(downloaded_filename)} ({file_size:.1f}MB)")
            
            with state_lock:
                item['status'] = 'Completed'
                item['filename'] = os.path.basename(downloaded_filename)
                item['filepath'] = downloaded_filename
                downloads['completed'] += 1
            broadcast_update()
        else:
            raise Exception("No file was downloaded")
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"[Item {item['id']}] ❌ DOWNLOAD FAILED: {error_msg}")
        logger.error(f"[Item {item['id']}] Traceback:\n{traceback.format_exc()}")
        with state_lock:
            item['status'] = 'Error'
            item['error'] = error_msg
        broadcast_update()

def worker_loop():
    logger.info("Worker thread started and waiting for tasks...")
    while True:
        try:
            url = task_queue.get()
            if url is None:
                logger.info("Worker received shutdown signal")
                break
            
            logger.info(f"Worker picked up URL from queue: {url}")
            with state_lock:
                downloads['downloading'] += 1
                item = next((x for x in downloads['queue'] if x['url']==url and x['status']=='Queued'), None)
                if item:
                    item['status'] = 'Starting'
                    logger.info(f"[Item {item['id']}] Status changed to Starting")
            broadcast_update()
            
            if item:
                download_one(item)
            else:
                logger.warning(f"Item not found in queue for URL: {url}")
            
            time.sleep(0.2)
            with state_lock:
                downloads['downloading'] -= 1
            broadcast_update()
            task_queue.task_done()
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            logger.error(traceback.format_exc())

def start_workers():
    for i in range(MAX_CONCURRENT):
        t = threading.Thread(target=worker_loop, daemon=True)
        t.start()
        logger.info(f"Started worker thread #{i+1}")

# API Routes
@app.route("/api/queue", methods=["POST"])
def queue_download():
    global next_id
    try:
        data = request.get_json(force=True, silent=True) or {}
        urls = data.get("urls", [])
        logger.info(f"Received queue request with {len(urls)} URL(s)")
        
        with state_lock:
            for raw_url in urls:
                url = (raw_url or "").strip()
                if not url:
                    continue
                item = {"id": next_id, "url": url, "status": "Queued", "progress": 0.0}
                next_id += 1
                downloads['queue'].append(item)
                downloads['total'] += 1
                logger.info(f"[Item {item['id']}] Queued: {url}")
                task_queue.put(url)
        
        broadcast_update()
        return jsonify(downloads)
    except Exception as e:
        logger.error(f"Queue endpoint error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/api/upload", methods=["POST"])
def upload_file():
    global next_id
    try:
        f = request.files.get("file")
        if not f:
            return jsonify({"error": "No file"}), 400
        lines = [ln.strip() for ln in f.read().decode("utf-8", errors="ignore").splitlines() if ln.strip()]
        logger.info(f"Received file upload with {len(lines)} URL(s)")
        
        with state_lock:
            for url in lines:
                item = {"id": next_id, "url": url, "status": "Queued", "progress": 0.0}
                next_id += 1
                downloads['queue'].append(item)
                downloads['total'] += 1
                logger.info(f"[Item {item['id']}] Queued from file: {url}")
                task_queue.put(url)
        
        broadcast_update()
        return jsonify(downloads)
    except Exception as e:
        logger.error(f"Upload endpoint error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/api/status")
def status():
    with state_lock:
        return jsonify(downloads)

@app.route("/api/events")
def events():
    """Server-Sent Events endpoint for real-time updates"""
    def event_stream():
        client_queue = Queue()
        with sse_lock:
            sse_clients.append(client_queue)
        logger.info("New SSE client connected")
        
        try:
            # Send initial state
            with state_lock:
                data = json.dumps(downloads)
            yield f"data: {data}\n\n"
            
            # Send updates as they occur
            while True:
                data = client_queue.get()
                yield f"data: {data}\n\n"
        except GeneratorExit:
            logger.info("SSE client disconnected")
            with sse_lock:
                if client_queue in sse_clients:
                    sse_clients.remove(client_queue)
    
    return Response(event_stream(), mimetype="text/event-stream")

@app.route("/api/download/<int:item_id>")
def download_file(item_id):
    """Serve the downloaded file to trigger browser download"""
    try:
        with state_lock:
            item = next((x for x in downloads['queue'] if x['id'] == item_id), None)
        
        if not item:
            logger.warning(f"Download requested for non-existent item #{item_id}")
            return jsonify({"error": "Item not found"}), 404
        
        if item['status'] != 'Completed':
            logger.warning(f"Download requested for incomplete item #{item_id} (status: {item['status']})")
            return jsonify({"error": "File not ready"}), 400
        
        filepath = item.get('filepath')
        if not filepath or not os.path.exists(filepath):
            logger.error(f"File not found for item #{item_id}: {filepath}")
            return jsonify({"error": "File not found"}), 404
        
        filename = item.get('filename', 'video.mp4')
        logger.info(f"Serving file: {filename} for item #{item_id}")
        return send_file(filepath, as_attachment=True, download_name=filename)
    except Exception as e:
        logger.error(f"Download endpoint error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/api/clear", methods=["POST"])
def clear_downloads():
    global next_id
    try:
        logger.info("Clearing all downloads...")
        with state_lock:
            # Clean up old files before clearing
            for item in downloads['queue']:
                filepath = item.get('filepath')
                if filepath and os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                        logger.info(f"Deleted file: {os.path.basename(filepath)}")
                    except Exception as e:
                        logger.warning(f"Failed to delete {filepath}: {e}")
            
            downloads['total'] = 0
            downloads['completed'] = 0
            downloads['downloading'] = 0
            downloads['queue'] = []
            next_id = 1
            # Clear the task queue
            while not task_queue.empty():
                try:
                    task_queue.get_nowait()
                except:
                    break
        
        logger.info("✓ All downloads cleared")
        broadcast_update()
        return jsonify(downloads)
    except Exception as e:
        logger.error(f"Clear endpoint error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Web-based log viewer
@app.route("/logs")
def view_logs():
    """Return logs as HTML page"""
    with log_lock:
        logs_list = list(log_messages)
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Video Downloader - Live Logs</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Courier New', monospace; 
                background: #0a0e17; 
                color: #e0e0e0; 
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            }
            h1 { color: white; font-size: 24px; margin-bottom: 10px; }
            .stats { 
                display: flex; 
                gap: 20px; 
                color: rgba(255,255,255,0.9);
                font-size: 14px;
            }
            .stat { background: rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 5px; }
            .controls {
                background: rgba(255,255,255,0.05);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            button {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }
            button:hover { background: #764ba2; transform: translateY(-2px); }
            .auto-scroll-label {
                color: #e0e0e0;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
            .log-container { 
                background: rgba(255,255,255,0.03); 
                border-radius: 10px; 
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .log-entry { 
                padding: 8px 0; 
                border-bottom: 1px solid rgba(255,255,255,0.05);
                line-height: 1.5;
            }
            .log-entry:last-child { border-bottom: none; }
            .timestamp { color: #667eea; font-weight: bold; }
            .level-INFO { color: #4ade80; }
            .level-WARNING { color: #fbbf24; }
            .level-ERROR { color: #ef4444; }
            .message { color: #e0e0e0; margin-left: 10px; }
            .no-logs { 
                text-align: center; 
                padding: 40px; 
                color: #888;
                font-size: 16px;
            }
            ::-webkit-scrollbar { width: 10px; }
            ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 5px; }
            ::-webkit-scrollbar-thumb { background: #667eea; border-radius: 5px; }
            ::-webkit-scrollbar-thumb:hover { background: #764ba2; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎬 Video Downloader - Live Logs</h1>
            <div class="stats">
                <div class="stat">📊 Total Logs: <strong id="logCount">""" + str(len(logs_list)) + """</strong></div>
                <div class="stat">⏱️ Last Update: <strong id="lastUpdate">Just now</strong></div>
            </div>
        </div>
        
        <div class="controls">
            <button onclick="location.reload()">🔄 Refresh Logs</button>
            <button onclick="clearLogs()">🗑️ Clear Display</button>
            <label class="auto-scroll-label">
                <input type="checkbox" id="autoScroll" checked>
                Auto-scroll to bottom
            </label>
        </div>
        
        <div class="log-container" id="logContainer">
    """
    
    if logs_list:
        for log in logs_list:
            level_class = f"level-{log['level']}"
            html += f"""
            <div class="log-entry">
                <span class="timestamp">[{log['timestamp']}]</span>
                <span class="{level_class}">[{log['level']}]</span>
                <span class="message">{log['message']}</span>
            </div>
            """
    else:
        html += '<div class="no-logs">No logs yet. Start downloading to see activity!</div>'
    
    html += """
        </div>
        
        <script>
            // Auto-scroll to bottom if checkbox is checked
            function scrollToBottom() {
                const container = document.getElementById('logContainer');
                const autoScroll = document.getElementById('autoScroll');
                if (autoScroll.checked) {
                    container.scrollTop = container.scrollHeight;
                }
            }
            
            function clearLogs() {
                if (confirm('Clear log display? (Logs will repopulate on next refresh)')) {
                    document.getElementById('logContainer').innerHTML = 
                        '<div class="no-logs">Logs cleared. Refresh page to see new logs.</div>';
                }
            }
            
            // Auto-refresh every 5 seconds
            setInterval(() => {
                const wasAtBottom = isScrolledToBottom();
                location.reload();
            }, 5000);
            
            function isScrolledToBottom() {
                const container = document.getElementById('logContainer');
                return container.scrollHeight - container.scrollTop === container.clientHeight;
            }
            
            // Initial scroll
            scrollToBottom();
            
            // Update timestamp
            setInterval(() => {
                const now = new Date();
                document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
            }, 1000);
        </script>
    </body>
    </html>
    """
    
    return html

@app.route("/logs/json")
def logs_json():
    """Return logs as JSON for API access"""
    with log_lock:
        return jsonify({
            "logs": list(log_messages),
            "count": len(log_messages)
        })

@app.route("/")
def index():
    """System info page"""
    try:
        import yt_dlp
        ytdlp_version = yt_dlp.version.__version__
    except:
        ytdlp_version = "unknown"
    
    return jsonify({
        "message": "Video Downloader API - Running! 🚀",
        "status": "online",
        "system_info": {
            "python_version": sys.version,
            "yt_dlp_version": ytdlp_version,
            "ffmpeg": "available" if FFMPEG_PATH else "not found",
            "download_folder": DOWNLOAD_FOLDER,
            "worker_threads": threading.active_count(),
        },
        "endpoints": [
            "GET  /           - This page",
            "GET  /logs       - Live log viewer (HTML)",
            "GET  /logs/json  - Logs as JSON",
            "GET  /api/status - Current downloads",
            "GET  /api/events - SSE real-time updates",
            "POST /api/queue  - Add download",
            "POST /api/upload - Upload URL list",
            "GET  /api/download/<id> - Download file",
            "POST /api/clear  - Clear all"
        ]
    })

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("🚀 Starting Video Downloader Backend")
    logger.info("=" * 60)
    start_workers()
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"📡 Server port: {port}")
    logger.info(f"📁 Download folder: {DOWNLOAD_FOLDER}")
    logger.info(f"🎬 FFmpeg: {'✓ Available' if FFMPEG_PATH else '✗ Not found'}")
    logger.info(f"🐍 Python: {sys.version.split()[0]}")
    logger.info(f"🌐 Log viewer: http://localhost:{port}/logs")
    logger.info("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)