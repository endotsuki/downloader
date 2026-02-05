import { Alert02Icon } from '@hugeicons/core-free-icons';

type PlatformIcon = { type: 'iconza'; name: string } | { type: 'hugeicons'; icon: typeof Alert02Icon };

export const getPlatformIcon = (url: string): PlatformIcon => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube') || urlLower.includes('youtu.be')) return { type: 'iconza', name: 'YouTube' };
  if (urlLower.includes('facebook')) return { type: 'iconza', name: 'FacebookSquare' };
  if (urlLower.includes('tiktok')) return { type: 'iconza', name: 'TikTokFill' };
  if (urlLower.includes('instagram')) return { type: 'iconza', name: 'Instagram' };
  if (urlLower.includes('pin')) return { type: 'iconza', name: 'Pinterest' };
  if (urlLower.includes('x.com')) return { type: 'iconza', name: 'Twitter' };
  if (urlLower.includes('linkedin')) return { type: 'iconza', name: 'LinkedIn' };
  if (urlLower.includes('reddit')) return { type: 'iconza', name: 'Reddit' };
  if (urlLower.includes('twitch')) return { type: 'iconza', name: 'Twitch' };
  if (urlLower.includes('snapchat')) return { type: 'iconza', name: 'Snapchat' };
  if (urlLower.includes('vk.com')) return { type: 'iconza', name: 'VK' };
  if (urlLower.includes('xiaohongshu')) return { type: 'iconza', name: 'RedNote' };
  if (urlLower.includes('bilibili')) return { type: 'iconza', name: 'Bilibili' };
  if (urlLower.includes('vimeo')) return { type: 'iconza', name: 'Vimeo' };
  return { type: 'hugeicons', icon: Alert02Icon };
};
