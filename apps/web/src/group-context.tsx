import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiRequestError, getCurrentUser, type CurrentUser } from "./api";
import { GroupContext } from "./group-context-value";

export function GroupProvider({
  children,
  onUnauthenticated,
}: {
  children: ReactNode;
  onUnauthenticated: () => void;
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setCurrentUser(await getCurrentUser());
    } catch (error) {
      setCurrentUser(null);
      if (error instanceof ApiRequestError && error.status === 401) {
        onUnauthenticated();
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : "データの取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthenticated]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const value = useMemo(
    () => ({
      currentGroup: currentUser?.groups[0] ?? null,
      currentUser,
      errorMessage,
      isLoading,
      refresh,
      unauthenticate: onUnauthenticated,
    }),
    [currentUser, errorMessage, isLoading, onUnauthenticated, refresh],
  );

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}
