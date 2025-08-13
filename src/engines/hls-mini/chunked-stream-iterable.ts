export type ChunkedStreamIterableOptions = {
  minChunkSize: number;
};

export interface ChunkedIterable extends AsyncIterable<Uint8Array<ArrayBufferLike>> {
  readonly minChunkSize: number;
  readonly error: Error | undefined;
}

const DEFAULT_MIN_CHUNK_SIZE = Math.pow(2, 17); // 128kb

export class ChunkedStreamIterable implements ChunkedIterable {
  protected _error: Error | undefined;
  public readonly minChunkSize: number;

  constructor(
    protected readableStream: NonNullable<Response['body']>,
    { minChunkSize = DEFAULT_MIN_CHUNK_SIZE }: ChunkedStreamIterableOptions = { minChunkSize: DEFAULT_MIN_CHUNK_SIZE }
  ) {
    this.minChunkSize = minChunkSize;
  }

  get error() {
    return this._error;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<Uint8Array<ArrayBufferLike>> {
    let chunk: Uint8Array<ArrayBufferLike> | undefined;
    const reader = this.readableStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Last chunk, if any bits remain
          if (chunk) {
            const outgoingChunk = chunk;
            chunk = undefined;
            yield outgoingChunk;
          }
          break;
        }

        if (chunk) {
          let newChunk: Uint8Array<ArrayBuffer> | undefined = new Uint8Array(chunk.length + value.length);
          newChunk.set(chunk);
          newChunk.set(value, chunk.length);
          chunk = newChunk;
          newChunk = undefined;
        } else {
          chunk = value;
        }

        while (chunk) {
          if (chunk.length >= this.minChunkSize) {
            const outgoingChunk = chunk;
            chunk = undefined;
            yield outgoingChunk;
            break;
          } else {
            break;
          }
        }
      }
    } catch (e) {
      // There are edge case errors when attempting to read() from ReadableStream reader.
      this._error = e as Error;
    } finally {
      // Last chunk, if any bits remain
      if (chunk) {
        const outgoingChunk = chunk;
        chunk = undefined;
        yield outgoingChunk;
      }
      reader.releaseLock();
      return;
    }
  }
}
