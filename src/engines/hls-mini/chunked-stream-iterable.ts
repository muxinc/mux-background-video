export interface ChunkedIterable
  extends AsyncIterable<Uint8Array<ArrayBufferLike>> {
  readonly error: Error | undefined;
}

const DEFAULT_MIN_CHUNK_SIZE = Math.pow(2, 17); // 128kb

export class ChunkedStreamIterable implements ChunkedIterable {
  #error: Error | undefined;

  constructor(protected readableStream: NonNullable<Response['body']>) {}

  get error() {
    return this.#error;
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
          let newChunk: Uint8Array<ArrayBuffer> | undefined = new Uint8Array(
            chunk.length + value.length
          );
          newChunk.set(chunk);
          newChunk.set(value, chunk.length);
          chunk = newChunk;
          newChunk = undefined;
        } else {
          chunk = value;
        }

        while (chunk) {
          if (chunk.length >= DEFAULT_MIN_CHUNK_SIZE) {
            const outgoingChunk = chunk;
            chunk = undefined;
            yield outgoingChunk;
            break;
          } else {
            break;
          }
        }
      }
    } catch (error) {
      // There are edge case errors when attempting to read() from ReadableStream reader.
      this.#error = error as Error;
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
