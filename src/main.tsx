import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import VideoDownloader from './components/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoDownloader />
  </StrictMode>
);
