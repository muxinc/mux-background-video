type PartialMediaInterface = Pick<HTMLMediaElement, 'play' | 'pause'>;

export interface IMediaDisplay extends PartialMediaInterface {
  src: string;
}

export interface IMediaEngine {
  src: string;
  load(): Promise<void>;
  attachMedia(media: any): void;
}
