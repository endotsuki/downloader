import type { RefObject } from "react";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  Download01Icon,
  Download05Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (value: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (handle: FileSystemDirectoryHandle | null) => void;
  queueSingle: () => void;
  uploadList: () => void;
  clearDownloads: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  clearDownloads,
  fileInputRef,
}: DownloadControlsProps) {
  const handleSelectDirectory = async () => {
    if (!("showDirectoryPicker" in window)) {
      alert(
        "Directory picker is not supported in this browser. Please use Chrome, Edge, or Opera."
      );
      return;
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: "readwrite",
      });
      setSelectedDirectory(directoryHandle);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error selecting directory:", error);
        alert("Failed to select directory. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Directory Selection */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[300px] px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-sm">
          {selectedDirectory ? (
            <span className="text-emerald-400">
              📁 {selectedDirectory.name}
            </span>
          ) : (
            <span className="text-gray-400">
              No folder selected (will use browser default)
            </span>
          )}
        </div>
        <Button variant="design-review" onClick={handleSelectDirectory}>
          <HugeiconsIcon icon={Folder01Icon} size={23} />
          Choose Folder
        </Button>
        {selectedDirectory && (
          <Button
            variant="in-review"
            onClick={() => setSelectedDirectory(null)}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Single URL Download */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          className="flex-1 min-w-[300px] px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
          type="text"
          placeholder="Paste video URL here..."
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && queueSingle()}
        />
        <Button variant="on-hold" onClick={queueSingle}>
          <HugeiconsIcon icon={Download01Icon} size={23} />
          Download
        </Button>
      </div>

      {/* Batch Upload */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          ref={fileInputRef}
          className="flex-1 cursor-pointer min-w-[300px] px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer file:transition-all"
          type="file"
          accept=".txt"
        />
        <Button variant="design-review" onClick={uploadList}>
          <HugeiconsIcon icon={Download05Icon} size={23} />
          Batch Download
        </Button>
        <Button variant="in-review" onClick={clearDownloads}>
          <HugeiconsIcon icon={Delete01Icon} size={23} />
          Clear downloads
        </Button>
      </div>
    </div>
  );
}
