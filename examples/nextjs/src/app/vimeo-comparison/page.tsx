'use client';

export default function VimeoComparisonPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: /*css*/ `
          html,
          body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          
          .comparison-container {
            display: flex;
            width: 100%;
            height: 100vh;
          }
          
          .comparison-iframe {
            flex: 1;
            width: 50%;
            height: 100%;
            border: none;
          }
        `,
        }}
      />
      <div className="comparison-container">
        <iframe
          className="comparison-iframe"
          src="/vimeo-iframe"
          title="Vimeo iFrame"
        />
        <iframe
          className="comparison-iframe"
          src="/vimeo-m3u8"
          title="Mux BGV w/ Vimeo m3u8"
        />
      </div>
    </>
  );
}
