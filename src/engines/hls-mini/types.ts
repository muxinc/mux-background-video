export type HlsMiniConfig = {
  audio?: boolean;
  maxResolution?: string;
  maxBufferLength?: number;
};

type BaseRendition = {
  uri?: string;
  mimeType: string;
  codec?: string;
  codecs?: string;
  segments?: Segment[];
};

export type AudioRendition = BaseRendition & {
  type?: 'audio';
  default?: 'YES' | 'NO';
  groupId?: string;
};

export type VideoRendition = BaseRendition & {
  audio?: string;
  width?: number;
  height?: number;
};

export type Rendition = AudioRendition & VideoRendition;

export type Segment = {
  duration: number;
  uri?: string;
  start?: number;
  end?: number;
};

declare global {
  interface ManagedMediaSource extends MediaSource {}
  // NOTE: Using "Maybe typing" (aka type or undefined) so importing this module doesn't assert that ManagedMediaSource will definitely exist.
  var ManagedMediaSource:
    | {
        prototype: ManagedMediaSource;
        new (): ManagedMediaSource;
      }
    | undefined;
  interface Window {
    ManagedMediaSource?: ManagedMediaSource;
  }
}
