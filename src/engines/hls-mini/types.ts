import { IMediaDisplay } from '../../types';

export type HlsMiniState = {
  src: string;
  mediaDisplay?: IMediaDisplay;
  mediaSourceUrl?: string;
  mediaSource?: MediaSource;
  audio?: any;
  video?: any;
};

type BaseRendition = {
  uri?: string;
  mimeType: string;
  codec?: string;
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
