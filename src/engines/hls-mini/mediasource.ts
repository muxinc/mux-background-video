import { loadPlaylist } from './playlists';
import { createStreams, switchToStream } from './streams';
import type { MultivariantPlaylist } from './types';

export const loadMedia = async ({ src }: { src: string }) => {
  const multivariantPlaylist = await loadPlaylist(src) as MultivariantPlaylist;
  
  let streams = createStreams(multivariantPlaylist);
  streams = await switchToStream(streams, 0);
  
  console.log(streams.video[0].segments);

  const mediaSource = new MediaSource();
  const mediaSourceUrl = URL.createObjectURL(mediaSource);

  return {
    mediaSourceUrl,
  };
};
