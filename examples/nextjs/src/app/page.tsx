import { MuxBackgroundVideo } from '@mux/mux-background-video/react';

export default function Home() {
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
      <MuxBackgroundVideo src="https://stream.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg.m3u8">
        <img
          src="https://image.mux.com/crDG1Lz1004PuNKSqiw02PFumJlY7nx500v5M02RXdD36hg/thumbnail.webp?time=0"
          alt="Mux Background Video"
        />
      </MuxBackgroundVideo>
    </>
  );
}
