export function PageHeader() {
  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
      <h1 className='text-3xl font-semibold text-white'>Video Downloader</h1>
      <div className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 backdrop-blur-xl'>
        <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
        <span className='font-medium'>Fast • High Quality Downloads</span>
      </div>
    </div>
  );
}
