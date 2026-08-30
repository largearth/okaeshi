import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiRequestError,
  getCurrentUser,
  getGroupWallets,
  type CurrentUser,
} from "./api";
import { GroupContext } from "./group-context-value";
import { useWalletStore } from "./stores/use-wallet-store";

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
  const beginWalletLoad = useWalletStore((state) => state.beginWalletLoad);
  const clearWallets = useWalletStore((state) => state.clearWallets);
  const setWalletError = useWalletStore((state) => state.setWalletError);
  const setWallets = useWalletStore((state) => state.setWallets);
  const walletReloadKey = useWalletStore((state) => state.walletReloadKey);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setCurrentUser(await getCurrentUser());
    } catch (error) {
      setCurrentUser(null);
      if (error instanceof ApiRequestError && error.status === 401) {
        clearWallets();
        onUnauthenticated();
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : "データの取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, [clearWallets, onUnauthenticated]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const currentGroup = currentUser?.groups[0] ?? null;

  useEffect(() => {
    if (!currentGroup) {
      clearWallets();
      return;
    }

    const groupId = currentGroup.id;
    if (!beginWalletLoad(groupId)) return;

    void getGroupWallets(groupId)
      .then((wallets) => {
        setWallets(groupId, wallets);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "財布情報の取得に失敗しました。";
        const wasApplied = setWalletError(groupId, message);
        if (
          wasApplied &&
          error instanceof ApiRequestError &&
          error.status === 401
        ) {
          clearWallets();
          onUnauthenticated();
        }
      });
  }, [
    beginWalletLoad,
    clearWallets,
    currentGroup,
    onUnauthenticated,
    setWalletError,
    setWallets,
    walletReloadKey,
  ]);

  const value = useMemo(
    () => ({
      currentGroup,
      currentUser,
      errorMessage,
      isLoading,
      refresh,
      unauthenticate: onUnauthenticated,
    }),
    [
      currentGroup,
      currentUser,
      errorMessage,
      isLoading,
      onUnauthenticated,
      refresh,
    ],
  );

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}
