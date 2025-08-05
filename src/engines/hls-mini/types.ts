import { IMediaDisplay } from '../../types';

export type HlsMiniState = {
  src: string;
  mediaDisplay?: IMediaDisplay;
  mediaSourceUrl?: string;
  mediaSource?: MediaSource;
  audio?: any;
  video?: any;
};
