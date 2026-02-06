import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { StatsCards } from './StatusCards';
import { DownloadTable } from './DownloadTable';
import { Icon } from 'iconza';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface DownloadItem {
  id: number;
  url: string;
  status: string;
  progress: number;
  error?: string;
  filename?: string;
  filepath?: string;
  size?: string;
  duration?: string;
}

export interface StatsData {
  total: number;
  completed: number;
  downloading: number;
  queue: DownloadItem[];
}

export default function VideoDownloader() {
  const [videoLink, setVideoLink] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    completed: 0,
    downloading: 0,
    queue: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadedItemsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-download when items become completed
  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status === 'Completed' && item.filename && !downloadedItemsRef.current.has(item.id)) {
        downloadedItemsRef.current.add(item.id);

        // If user selected a directory, write directly to it
        if (selectedDirectory) {
          try {
            // Fetch the file from server
            const response = await fetch(`${API_BASE_URL}/download/${item.id}`);
            if (!response.ok) throw new Error('Failed to fetch file');

            const blob = await response.blob();

            // Write to selected directory using File System Access API
            const fileHandle = await selectedDirectory.getFileHandle(item.filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            console.log(`✓ Saved to selected folder: ${item.filename}`);
          } catch (error) {
            console.error('Error saving to selected directory:', error);
            // Fallback to browser download
            triggerBrowserDownload(item.id, item.filename);
          }
        } else {
          // No directory selected, use browser download
          triggerBrowserDownload(item.id, item.filename);
        }
      }
    });
  }, [stats.queue, selectedDirectory]);

  const triggerBrowserDownload = (itemId: number, filename: string) => {
    const downloadUrl = `${API_BASE_URL}/download/${itemId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const queueSingle = async () => {
    const link = videoLink.trim();
    if (!link) {
      alert('Please enter a link');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: [link] }),
      });
      const data = await response.json();
      setStats(data);
      setVideoLink('');
    } catch (error) {
      console.error('Failed to queue download:', error);
    }
  };

  const uploadList = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Choose .txt file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setStats(data);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const clearDownloads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
      });
      const data = await response.json();
      setStats(data);
      setCurrentPage(1); // Reset to first page after clearing
    } catch (error) {
      console.error('Failed to clear downloads:', error);
    }
  };

  const queuedCount = stats.queue.filter((q) => q.status === 'Queued').length;

  return (
    <div className='min-h-screen bg-[#0a0e17] p-6 text-white'>
      <div className='mx-auto w-[95%] max-w-[1600px]'>
        <PageHeader />
        <DownloadControls
          videoLink={videoLink}
          setVideoLink={setVideoLink}
          selectedDirectory={selectedDirectory}
          setSelectedDirectory={setSelectedDirectory}
          queueSingle={queueSingle}
          uploadList={uploadList}
          fileInputRef={fileInputRef}
        />

        <StatsCards total={stats.total} completed={stats.completed} downloading={stats.downloading} queued={queuedCount} />

        <DownloadTable
          queue={stats.queue}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          setCurrentPage={setCurrentPage}
          clearDownloads={clearDownloads}
          setRowsPerPage={setRowsPerPage}
        />

        {/* Footer */}
        <div className='mt-6 border-t border-white/10 pt-6 text-center'>
          <p className='text-sm text-gray-400'>
            Auto-refresh every <span className='font-medium text-white'>1s</span> • Processing{' '}
            <span className='font-medium text-white'>one by one</span> • Supports <span className='font-medium text-white'>500+ links</span>
          </p>
          <p className='mt-2 select-none text-sm text-gray-400'>&copy; {new Date().getFullYear()} MMO &bull; All rights reserved</p>
        </div>
        <div className='mt-6 flex items-center justify-center gap-2'>
          <Icon name='FacebookSquare' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='TikTok' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Instagram' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Pinterest' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Vimeo' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Twitter' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Twitch' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Reddit' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='LinkedIn' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Bilibili' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='Snapchat' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='VK' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
          <Icon name='RedNote' className='mx-auto mt-4 h-6 w-6 text-gray-500' />
        </div>
      </div>
    </div>
  );
}
