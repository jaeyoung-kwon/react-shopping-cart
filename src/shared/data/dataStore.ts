type Data<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  fetchFn: () => Promise<T>;
  updatedAt: number;
};

type Listener = () => void;

const store = new Map<string, Data<unknown>>();
const listeners: Record<string, Set<Listener>> = {};

const gcTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const inFlightFetches = new Map<string, Promise<unknown>>();

export function subscribe(key: string, callback: Listener, gcTime: number) {
  console.log(`subscribe called for key: ${key}`);
  console.log(`Current listeners:`, listeners);
  if (!listeners[key]) {
    listeners[key] = new Set();
  }
  listeners[key].add(callback);

  const timeout = gcTimeouts.get(key);
  if (timeout) {
    clearTimeout(timeout);
    gcTimeouts.delete(key);
  }

  return () => {
    listeners[key]?.delete(callback);

    if (listeners[key]?.size === 0) {
      delete listeners[key];
      const timeout = setTimeout(() => {
        store.delete(key);
        gcTimeouts.delete(key);
      }, gcTime);
      gcTimeouts.set(key, timeout);
    }
  };
}

export function getSnapshot<T>(key: string) {
  console.log(`getSnapshot called for key: ${key}`);
  console.log(`Current store:`, store);
  return store.get(key) as Data<T>;
}

export function updateData<T>(key: string, newValue: Partial<Data<T>>) {
  const prev = store.get(key) as Data<T>;

  store.set(key, {
    ...prev,
    ...newValue,
  });

  listeners[key]?.forEach((cb) => cb());
}

export async function refetchData<T>(
  key: string,
  options?: {
    fetchFn?: () => Promise<T>;
    onSuccess?: () => void;
    onError?: () => void;
  }
) {
  const storeItem = store.get(key) as Data<T>;

  const finalFetchFn = options?.fetchFn ?? storeItem?.fetchFn;
  if (!finalFetchFn) return null;

  if (inFlightFetches.has(key)) {
    return inFlightFetches.get(key);
  }

  updateData(key, { isLoading: true, isError: false });

  const fetchPromise = finalFetchFn()
    .then((result) => {
      updateData(key, {
        data: result,
        isLoading: false,
        isError: false,
        fetchFn: finalFetchFn,
        updatedAt: Date.now(),
      });
      options?.onSuccess?.();
      return result;
    })
    .catch(() => {
      updateData(key, {
        data: null,
        isLoading: false,
        isError: true,
      });
      options?.onError?.();
      return null;
    })
    .finally(() => {
      inFlightFetches.delete(key);
    });

  inFlightFetches.set(key, fetchPromise);

  return fetchPromise;
}
