import { create } from "zustand";
import { createWalletSlice, type WalletSlice } from "./wallet-slice";

export const useWalletStore = create<WalletSlice>()((set, get) =>
  createWalletSlice(set, get),
);
