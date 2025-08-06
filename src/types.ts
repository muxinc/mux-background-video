type PartialMediaInterface = Pick<HTMLMediaElement, 'play' | 'pause'>;

export interface IMediaDisplay extends PartialMediaInterface {
  src: string;
}

export interface IMediaEngine {
  src: string;
  attachMedia(media: IMediaDisplay): void;
}
