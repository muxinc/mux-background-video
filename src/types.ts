type PartialMediaInterface = Pick<
  HTMLMediaElement, 
  'play' | 'pause' | 'currentTime' | 'buffered'
>;

export interface IMediaDisplay extends PartialMediaInterface {
  src: string;
  load: () => void;
  addEventListener: (type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void;
}

export interface IMediaEngine<T> {
  src: string;
  config: T;
  attachMedia(media: IMediaDisplay): void;
  update(): void;
}
