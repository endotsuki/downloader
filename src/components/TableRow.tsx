import { Icon } from "iconza";
import type { DownloadItem } from "./App";
import { StatusBadge } from "./StatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon } from "@hugeicons/core-free-icons";
import { ProgressBar } from "./Progressbar";

interface TableRowProps {
  item: DownloadItem;
  index: number;
}

type PlatformIcon =
  | { type: "iconza"; name: string }
  | { type: "hugeicons"; icon: typeof Link01Icon };

export function TableRow({ item, index }: TableRowProps) {
  const getPlatformIcon = (url: string): PlatformIcon => {
    const urlLower = url.toLowerCase();

    if (urlLower.includes("youtube") || urlLower.includes("youtu.be")) {
      return { type: "iconza", name: "YouTube" };
    }
    if (urlLower.includes("facebook")) {
      return { type: "iconza", name: "FacebookSquare" };
    }
    if (urlLower.includes("tiktok")) {
      return { type: "iconza", name: "TikTokFill" };
    }
    if (urlLower.includes("instagram")) {
      return { type: "iconza", name: "Instagram" };
    }
    if (urlLower.includes("pin")) {
      return { type: "iconza", name: "Pinterest" };
    }
    return { type: "hugeicons", icon: Link01Icon };
  };

  const platformIcon = getPlatformIcon(item.url);

  return (
    <tr className="hover:bg-white/5 transition-all duration-200 group">
      <td className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-base font-medium text-gray-300 group-hover:bg-white/10 transition-colors">
            {index + 1}
          </span>
        </div>
      </td>

      <td className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
            {platformIcon.type === "iconza" ? (
              <Icon name={platformIcon.name} size={26} />
            ) : (
              <HugeiconsIcon icon={platformIcon.icon} size={26} />
            )}
          </div>
        </div>
      </td>

      <td className="p-4 border-b border-white/5">
        <div className="max-w-[400px]">
          <div
            className="truncate text-gray-300 text-sm group-hover:text-white transition-colors"
            title={item.url}
          >
            {item.url}
          </div>
        </div>
      </td>

      <td className="p-4 border-b border-white/5">
        <ProgressBar progress={item.progress ?? 0} />
      </td>

      <td className="p-4 border-b border-white/5">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
