type Listener<T> = {
  keys: (keyof T)[];
  cb: (changedKeys: string[], store: T) => void;
};

export type Store<T extends Record<string, any>> = {
  put: (obj: Partial<T>) => void;
  listenKeys: (keys: (keyof T)[], cb: (changedKeys: string[], store: T) => void) => () => void;
  get: () => T;
};

export const createStore = <T extends Record<string, any>>(initialState: T): Store<T> => {
  let store = initialState;
  let listeners: Listener<T>[] = [];

  return {
    put: (obj: Partial<T>) => {
      const changed = Object.keys(obj).filter((k) => store[k] !== obj[k]);
      store = { ...store, ...obj };
      listeners.forEach(({ keys, cb }) => {
        const hits = changed.filter((k) => keys.includes(k));
        hits.length && cb(hits, store);
      });
    },
    listenKeys: (keys, cb) => {
      listeners.push({ keys, cb });
      return () => (listeners = listeners.filter((l) => l.cb !== cb));
    },
    get: () => store,
  };
};
