"use client";

import {
  createContext,
  createElement,
  use,
  useMemo,
  type ReactNode,
} from "react";
import { usePrivy, useWallets, type User } from "@privy-io/react-auth";

type WalletAction = () => void | Promise<void>;

export type PrivyWalletAbstraction = {
  hasPrivyConfigured: boolean;
  isUsingPrivy: boolean;
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  walletAddress: string | null;
  shortWalletAddress: string | null;
  login: WalletAction;
  logout: WalletAction;
  connectWallet: WalletAction;
};

export type PrivyWalletEnv = {
  appId: string | null;
  hasPrivyConfigured: boolean;
  isUsingPrivy: boolean;
};

const noopWalletAction: WalletAction = () => undefined;

export const disabledPrivyWalletAbstraction: PrivyWalletAbstraction = {
  hasPrivyConfigured: false,
  isUsingPrivy: false,
  ready: true,
  authenticated: false,
  user: null,
  walletAddress: null,
  shortWalletAddress: null,
  login: noopWalletAction,
  logout: noopWalletAction,
  connectWallet: noopWalletAction,
};

export const PrivyWalletAbstractionContext =
  createContext<PrivyWalletAbstraction>(disabledPrivyWalletAbstraction);

export function getPrivyWalletEnv(): PrivyWalletEnv {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() || null;
  const hasPrivyConfigured =
    Boolean(appId) && process.env.NEXT_PUBLIC_ENABLE_PRIVY === "true";
  const isUsingPrivy =
    hasPrivyConfigured &&
    process.env.NEXT_PUBLIC_WALLET_ABSTRACTION_MODE === "privy";

  return {
    appId,
    hasPrivyConfigured,
    isUsingPrivy,
  };
}

export function PrivyWalletAbstractionBridge({
  children,
}: {
  children: ReactNode;
}) {
  const privy = usePrivy();
  const privyWallets = useWallets();
  const { hasPrivyConfigured, isUsingPrivy } = getPrivyWalletEnv();
  const walletAddress = privyWallets.wallets[0]?.address ?? null;
  const shortWalletAddress = walletAddress
    ? formatShortWalletAddress(walletAddress)
    : null;

  const value = useMemo<PrivyWalletAbstraction>(
    () => ({
      hasPrivyConfigured,
      isUsingPrivy,
      ready: privy.ready && privyWallets.ready,
      authenticated: privy.authenticated,
      user: privy.user,
      walletAddress,
      shortWalletAddress,
      login: () => privy.login(),
      logout: () => privy.logout(),
      connectWallet: () => {
        if (privy.authenticated) {
          privy.connectWallet();
          return;
        }

        privy.login();
      },
    }),
    [
      hasPrivyConfigured,
      isUsingPrivy,
      privy,
      privyWallets.ready,
      shortWalletAddress,
      walletAddress,
    ],
  );

  return createElement(
    PrivyWalletAbstractionContext.Provider,
    { value },
    children,
  );
}

export function usePrivyWalletAbstraction(): PrivyWalletAbstraction {
  return use(PrivyWalletAbstractionContext);
}

function formatShortWalletAddress(value: string): string {
  if (value.length <= 14) return value;

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}
