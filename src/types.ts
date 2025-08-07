type PartialMediaInterface = Pick<
  HTMLMediaElement, 
  'play' | 'pause' | 'currentTime' | 'buffered'
>;

export interface IMediaDisplay extends PartialMediaInterface {
  src: string;
  addEventListener: (type: string, listener: EventListener) => void;
}

export interface IMediaEngine {
  src: string;
  attachMedia(media: IMediaDisplay): void;
}
