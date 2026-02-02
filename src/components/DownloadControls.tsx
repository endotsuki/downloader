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

const inputBase =
  "w-full rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20";

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
    <div className="space-y-6">
      {/* Primary: URL + Download */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Single URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            className={`flex-1 min-w-0 ${inputBase}`}
            type="text"
            placeholder="Paste video URL…"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && queueSingle()}
          />
          <Button
            variant="on-hold"
            onClick={queueSingle}
            className="shrink-0 sm:w-auto"
          >
            <HugeiconsIcon icon={Download01Icon} size={20} />
            Download
          </Button>
        </div>
      </div>

      {/* Secondary: Folder, Batch, Clear */}
      <div className="flex flex-col py-9 sm:flex-row sm:items-center gap-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 shrink-0">
            Save to
          </span>
          <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
            <div
              className={`flex items-center min-h-[40px] ${inputBase} text-zinc-400 cursor-default`}
            >
              {selectedDirectory ? (
                <span className="truncate text-emerald-400/90">
                  {selectedDirectory.name}
                </span>
              ) : (
                <span>Browser default</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="design-review" onClick={handleSelectDirectory}>
                <HugeiconsIcon icon={Folder01Icon} size={20} />
                Folder
              </Button>
              {selectedDirectory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDirectory(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div
          className="hidden sm:block w-px h-8 bg-zinc-700/80 shrink-0"
          aria-hidden
        />

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            id="batch-file"
            onChange={uploadList}
          />
          <Button variant="archived">
            <label
              htmlFor="batch-file"
              className="cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={Download05Icon} size={20} />
              Batch link .txt
            </label>
          </Button>
          <Button
            variant="ghost"
            onClick={clearDownloads}
            className="text-zinc-500 hover:text-red-400"
          >
            <HugeiconsIcon icon={Delete01Icon} size={20} />
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
}
