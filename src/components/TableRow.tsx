import { Icon } from "iconza";
import type { DownloadItem } from "./App";
import { StatusBadge } from "./StatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { ProgressBar } from "./Progressbar";

interface TableRowProps {
  item: DownloadItem;
  index: number;
}

type PlatformIcon =
  | { type: "iconza"; name: string }
  | { type: "hugeicons"; icon: typeof Alert02Icon };

export function TableRow({ item, index }: TableRowProps) {
  const getPlatformIcon = (url: string): PlatformIcon => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes("youtube") || urlLower.includes("youtu.be"))
      return { type: "iconza", name: "YouTube" };
    if (urlLower.includes("facebook"))
      return { type: "iconza", name: "FacebookSquare" };
    if (urlLower.includes("tiktok"))
      return { type: "iconza", name: "TikTokFill" };
    if (urlLower.includes("instagram"))
      return { type: "iconza", name: "Instagram" };
    if (urlLower.includes("pin")) return { type: "iconza", name: "Pinterest" };
    return { type: "hugeicons", icon: Alert02Icon };
  };

  const platformIcon = getPlatformIcon(item.url);

  return (
    <tr className="transition-colors hover:bg-zinc-800/50">
      <td className="py-3 px-4 align-middle">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700/60 text-xs font-medium text-zinc-400 tabular-nums">
          {index + 1}
        </span>
      </td>
      <td className="py-3 px-4 align-middle">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-700/60 text-zinc-400">
          {platformIcon.type === "iconza" ? (
            <Icon name={platformIcon.name} size={22} />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={22} className="bg-yellow-500 text-black rounded" />
          )}
        </div>
      </td>
      <td className="py-3 px-4 align-middle min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm text-zinc-400 hover:text-blue-400 transition-colors hover:underline max-w-full"
          title={item.url}
        >
          {item.url}
        </a>
      </td>
      <td className="py-3 px-4 align-middle">
        <ProgressBar progress={item.progress ?? 0} />
      </td>
      <td className="py-3 px-4 align-middle">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
