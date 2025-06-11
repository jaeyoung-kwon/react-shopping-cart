import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { getSnapshot, refetchData, subscribe } from './dataStore';

interface UseJaeOOptions<T, R = T> {
  fetchKey: string;
  fetchFn: () => Promise<T>;
  convertFn?: (raw: T) => R;
  onError?: () => void;
  onSuccess?: () => void;
  staleTime?: number;
}

export function useJaeO<T, R = T>({
  fetchKey,
  fetchFn,
  convertFn,
  onError,
  onSuccess,
  staleTime = 0,
}: UseJaeOOptions<T, R>) {
  const fetchFnRef = useRef(fetchFn);
  const convertFnRef = useRef(convertFn);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  const fetchAndUpdateData = useCallback(async () => {
    return refetchData<T>(fetchKey, {
      fetchFn: fetchFnRef.current,
      onError: onErrorRef.current,
      onSuccess: onSuccessRef.current,
    });
  }, [fetchKey]);

  const snapshot = useSyncExternalStore(
    useCallback(
      (cb) => {
        const unsubscribe = subscribe(fetchKey, cb);

        const curSnapshot = getSnapshot<T>(fetchKey);
        const shouldFetch =
          !curSnapshot?.data ||
          Date.now() - (curSnapshot?.updatedAt ?? 0) > staleTime;
        if (shouldFetch) {
          fetchAndUpdateData();
        }

        return unsubscribe;
      },
      [fetchAndUpdateData, fetchKey, staleTime]
    ),
    () => getSnapshot<T>(fetchKey)
  );

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    convertFnRef.current = convertFn;
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  });

  const convertedData = useMemo(
    () =>
      snapshot && snapshot.data !== null && snapshot.data !== undefined
        ? convertFnRef.current?.(snapshot.data) ?? (snapshot.data as R)
        : null,
    [snapshot]
  );

  return {
    data: convertedData,
    isLoading: snapshot?.isLoading ?? false,
    isError: snapshot?.isError ?? false,
    refetch: fetchAndUpdateData,
  };
}
