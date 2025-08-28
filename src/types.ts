export type Constructor<T> = {
  new (...args: any[]): T;
  prototype: T;
};

type PartialMediaInterface = Pick<
  HTMLMediaElement, 
  'play' | 'pause' | 'currentTime' | 'buffered'
>;

export interface IMediaDisplay extends PartialMediaInterface {
  src: string;
  muted: boolean;
  paused: boolean;
  load: () => void;
  addEventListener: (type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void;
}

export interface IMediaEngineStatic<T> {
  DefaultConfig: T;
  new (): IMediaEngine<T>;
}

export interface IMediaEngine<T> {
  config: T;
  attachMedia(media: IMediaDisplay): void;
  loadSource(src: string): void;
}
