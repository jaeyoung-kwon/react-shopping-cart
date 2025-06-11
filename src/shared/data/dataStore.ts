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

export function subscribe(key: string, callback: Listener) {
  // console.log(`subscribe called for key: ${key}`);
  // console.log(`Current listeners:`, listeners);
  if (!listeners[key]) {
    listeners[key] = new Set();
  }
  if (!listeners[key].has(callback)) {
    listeners[key].add(callback);
  }

  return () => {
    listeners[key]?.delete(callback);
  };
}

export function getSnapshot<T>(key: string) {
  // console.log(`getSnapshot called for key: ${key}`);
  // console.log(`Current store:`, store);
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

  updateData(key, { isLoading: true, isError: false });

  try {
    const result = await finalFetchFn();
    updateData(key, {
      data: result,
      isLoading: false,
      isError: false,
      fetchFn: finalFetchFn,
      updatedAt: Date.now(),
    });
    options?.onSuccess?.();
    return result;
  } catch (error) {
    updateData(key, {
      data: null,
      isLoading: false,
      isError: true,
    });
    options?.onError?.();
    return null;
  }
}
