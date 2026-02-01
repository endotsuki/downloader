export function PageHeader() {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="items-baseline gap-2">
        <h1 className="text-3xl font-semibold text-white">Video Downloader</h1>
        <span className="text-sm text-blue-500 font-medium">
          YouTube • Facebook • TikTok • Instagram • Pinterest
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-medium">Pro • High Quality Downloads</span>
      </div>
    </div>
  );
}
