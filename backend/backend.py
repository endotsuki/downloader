import os
import threading
import time
import tempfile
import glob
from queue import Queue
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from yt_dlp import YoutubeDL
from yt_dlp.networking.impersonate import ImpersonateTarget

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Use temp directory instead of project folder - files will be served to users and cleaned up
DOWNLOAD_FOLDER = tempfile.mkdtemp(prefix="video_downloader_")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
print(f"✓ Temporary download folder: {DOWNLOAD_FOLDER}")

def detect_ffmpeg():
    # First check bundled binary
    base_path = os.path.dirname(os.path.abspath(__file__))
    bundled_ffmpeg = os.path.join(base_path, "ffmpeg", "ffmpeg")
    if os.path.exists(bundled_ffmpeg):
        print(f"✓ FFMPEG DETECTED AT: {bundled_ffmpeg}")
        return bundled_ffmpeg
    
    import shutil
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        print(f"✓ FFMPEG DETECTED AT: {ffmpeg_path}")
        return ffmpeg_path
    
    print("⚠ FFmpeg not found. Download/merge will fail.")
    return None


FFMPEG_PATH = detect_ffmpeg()
MAX_CONCURRENT = 3

downloads = {
    "total": 0,
    "completed": 0,
    "downloading": 0,
    "queue": []
}
next_id = 1
task_queue = Queue()
state_lock = threading.Lock()

def ydl_options(progress_cb):
    opts = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'progress_hooks': [progress_cb],
        'restrictfilenames': True,
        'windowsfilenames': True,
        'updatetime': False,
        'noverifyhttpscert': True,
        'buffersize': 1024 * 16,
        'continuedl': True,
    }
    
    # Only use format merging if FFmpeg is available
    if FFMPEG_PATH:
        opts['format'] = 'bestvideo+bestaudio/best'
        opts['merge_output_format'] = 'mp4'
        opts['ffmpeg_location'] = FFMPEG_PATH
        opts['postprocessors'] = [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }]
    else:
        # Fallback to single format if FFmpeg not available
        print("⚠ FFmpeg not available - downloading single format only")
        opts['format'] = 'best'  # Download best single format (no merging needed)

    try:
        opts['impersonate'] = ImpersonateTarget.from_str('chrome')
    except Exception:
        opts['http_headers'] = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }

    return opts

def download_one(item):
    downloaded_filename = None
    
    def progress_hook(d):
        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate')
            if total:
                pct = d.get('downloaded_bytes', 0) * 100.0 / total
                with state_lock:
                    item['progress'] = max(0.0, min(100.0, pct))
                    item['status'] = 'Downloading'
        elif d['status'] == 'finished':
            with state_lock:
                item['progress'] = 100.0
                item['status'] = 'Merging'
            # Capture the filename when download finishes
            if 'filename' in d:
                nonlocal downloaded_filename
                downloaded_filename = d['filename']

    opts = ydl_options(progress_hook)
    try:
        with YoutubeDL(opts) as ydl:
            # Extract info first to get the expected filename
            info = ydl.extract_info(item['url'], download=False)
            expected_filename = ydl.prepare_filename(info)
            ydl.download([item['url']])
        
        # Use the expected filename, or find the most recently modified file as fallback
        if os.path.exists(expected_filename):
            downloaded_filename = expected_filename
        else:
            # Fallback: Get the most recently modified file in download folder
            files = glob.glob(os.path.join(DOWNLOAD_FOLDER, '*'))
            if files:
                downloaded_filename = max(files, key=os.path.getmtime)
        
        with state_lock:
            item['status'] = 'Completed'
            item['filename'] = os.path.basename(downloaded_filename) if downloaded_filename else None
            item['filepath'] = downloaded_filename if downloaded_filename else None
            downloads['completed'] += 1
    except Exception as e:
        print(f"--- DOWNLOAD FAILED: {str(e)} ---")
        with state_lock:
            item['status'] = 'Error'
            item['error'] = str(e)

def worker_loop():
    while True:
        url = task_queue.get()
        if url is None:
            break
        with state_lock:
            downloads['downloading'] += 1
            item = next((x for x in downloads['queue'] if x['url']==url and x['status']=='Queued'), None)
            if item:
                item['status'] = 'Starting'
        if item:
            download_one(item)
        time.sleep(0.2)
        with state_lock:
            downloads['downloading'] -= 1
        task_queue.task_done()

def start_workers():
    for _ in range(MAX_CONCURRENT):
        threading.Thread(target=worker_loop, daemon=True).start()

# API Routes
@app.route("/api/queue", methods=["POST"])
def queue_download():
    global next_id
    data = request.get_json(force=True, silent=True) or {}
    urls = data.get("urls", [])
    with state_lock:
        for raw_url in urls:
            url = (raw_url or "").strip()
            if not url:
                continue
            item = {"id": next_id, "url": url, "status": "Queued", "progress": 0.0}
            next_id += 1
            downloads['queue'].append(item)
            downloads['total'] += 1
            task_queue.put(url)
    return jsonify(downloads)

@app.route("/api/upload", methods=["POST"])
def upload_file():
    global next_id
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file"}), 400
    lines = [ln.strip() for ln in f.read().decode("utf-8", errors="ignore").splitlines() if ln.strip()]
    with state_lock:
        for url in lines:
            item = {"id": next_id, "url": url, "status": "Queued", "progress": 0.0}
            next_id += 1
            downloads['queue'].append(item)
            downloads['total'] += 1
            task_queue.put(url)
    return jsonify(downloads)

@app.route("/api/status")
def status():
    with state_lock:
        return jsonify(downloads)

@app.route("/api/download/<int:item_id>")
def download_file(item_id):
    """Serve the downloaded file to trigger browser download"""
    with state_lock:
        item = next((x for x in downloads['queue'] if x['id'] == item_id), None)
    
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    if item['status'] != 'Completed':
        return jsonify({"error": "File not ready"}), 400
    
    filepath = item.get('filepath')
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    
    filename = item.get('filename', 'video.mp4')
    return send_file(filepath, as_attachment=True, download_name=filename)

@app.route("/api/clear", methods=["POST"])
def clear_downloads():
    global next_id
    import shutil
    
    with state_lock:
        # Clean up old files before clearing
        for item in downloads['queue']:
            filepath = item.get('filepath')
            if filepath and os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass
        
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
    return jsonify(downloads)

if __name__ == "__main__":
    start_workers()
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)