import { MuxBackgroundVideo } from 'mux-background-video/dist/react';

export default function Home() {
  return (
    <MuxBackgroundVideo
      src="https://stream.mux.com/XmScTfBovGOFDzH024025XpMGMWnaJEIHQS2hI98tpS00Y.m3u8"
      maxResolution="270p"
    />
  );
}
