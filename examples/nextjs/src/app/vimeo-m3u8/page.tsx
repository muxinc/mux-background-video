import { MuxBackgroundVideo } from '@mux/mux-background-video/react';

async function getVimeoM3U8Url() {
  const vimeoUrl = 'https://player.vimeo.com/external/606618627.m3u8?s=59fffd516ccadf0d88a3199f9c1c336f49a935b7&f=fmp4';
  
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

export default async function VimeoM3U8Page() {
  const m3u8Url = await getVimeoM3U8Url();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: /*css*/ `
          html,
          body {
            height: 100%;
          }
        `,
        }}
      />
      <MuxBackgroundVideo src={m3u8Url}>
        <img
          src="./vimeo-poster.webp"
          alt="Vimeo Background Video"
        />
      </MuxBackgroundVideo>
    </>
  );
}
