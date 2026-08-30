import type { Wallet } from "../api";

export type WalletStatus = "idle" | "loading" | "success" | "error";

export type WalletSlice = {
  walletGroupId: string | null;
  wallets: Wallet[];
  walletStatus: WalletStatus;
  walletErrorMessage: string | null;
  walletReloadKey: number;
  beginWalletLoad: (groupId: string) => boolean;
  setWallets: (groupId: string, wallets: Wallet[]) => boolean;
  setWalletError: (groupId: string, message: string) => boolean;
  clearWallets: () => void;
  retryWalletLoad: () => void;
};

type SetState = (
  partial:
    Partial<WalletSlice> | ((state: WalletSlice) => Partial<WalletSlice>),
) => void;

type GetState = () => WalletSlice;

export function createWalletSlice(set: SetState, get: GetState): WalletSlice {
  return {
    walletGroupId: null,
    wallets: [],
    walletStatus: "idle",
    walletErrorMessage: null,
    walletReloadKey: 0,
    beginWalletLoad: (groupId) => {
      const state = get();
      if (
        state.walletGroupId === groupId &&
        (state.walletStatus === "loading" || state.walletStatus === "success")
      ) {
        return false;
      }

      set({
        walletGroupId: groupId,
        wallets: [],
        walletStatus: "loading",
        walletErrorMessage: null,
      });
      return true;
    },
    setWallets: (groupId, wallets) => {
      if (get().walletGroupId !== groupId) return false;

      set({
        wallets,
        walletStatus: "success",
        walletErrorMessage: null,
      });
      return true;
    },
    setWalletError: (groupId, message) => {
      if (get().walletGroupId !== groupId) return false;

      set({
        wallets: [],
        walletStatus: "error",
        walletErrorMessage: message,
      });
      return true;
    },
    clearWallets: () => {
      set({
        walletGroupId: null,
        wallets: [],
        walletStatus: "idle",
        walletErrorMessage: null,
      });
    },
    retryWalletLoad: () => {
      if (!get().walletGroupId) return;

      set((state) => ({
        walletStatus: "idle",
        walletErrorMessage: null,
        walletReloadKey: state.walletReloadKey + 1,
      }));
    },
  };
}
