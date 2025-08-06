import { IMediaDisplay } from '../../types';

export type HlsMiniState = {
  src: string;
  mediaDisplay?: IMediaDisplay;
  mediaSourceUrl?: string;
  mediaSource?: MediaSource;
  audio?: any;
  video?: any;
};

export type Rendition = {
  uri?: string;
  mimeType: string;
  codec?: string;
  duration?: number;
  groupId?: string;
  audio?: string;
};

export type Segment = { 
  duration: number; 
  uri?: string;
};
