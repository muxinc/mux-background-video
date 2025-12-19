import VimeoComparisonClient from './client';

async function getVimeoM3U8Url() {
  const vimeoUrl = 'https://player.vimeo.com/external/468763311.m3u8?s=861ef37389d1ad00b64a4e04665a7bffd4bfdc78&f=fmp4';
  
  try {
    const response = await fetch(vimeoUrl, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store', // Don't cache the redirect URL
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    return response.url;
  } catch (error) {
    console.error('Error fetching Vimeo m3u8 redirect:', error);
    throw error;
  }
}

export default async function VimeoComparisonPage() {
  const m3u8Url = await getVimeoM3U8Url();

  return <VimeoComparisonClient m3u8Url={m3u8Url} />;
}
