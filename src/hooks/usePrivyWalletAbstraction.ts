"use client";

import {
  createContext,
  createElement,
  use,
  useMemo,
  type ReactNode,
} from "react";
import { usePrivy, useWallets, type User } from "@privy-io/react-auth";
import {
  useCreateWallet,
  useSignRawHash,
} from "@privy-io/react-auth/extended-chains";

type WalletAction = () => void | Promise<void>;
type CreateStellarWalletAction = () => Promise<string | null>;
type SignStellarHashAction = (
  hash: `0x${string}`,
  addressOverride?: string,
) => Promise<`0x${string}`>;
type LinkedAccount = User["linkedAccounts"][number];
type LinkedWalletAccount = Extract<LinkedAccount, { type: "wallet" }>;

export type PrivyWalletAbstraction = {
  hasPrivyConfigured: boolean;
  isUsingPrivy: boolean;
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  walletAddress: string | null;
  shortWalletAddress: string | null;
  stellarWalletAddress: string | null;
  shortStellarWalletAddress: string | null;
  hasStellarWallet: boolean;
  createStellarWallet: CreateStellarWalletAction;
  signStellarHash: SignStellarHashAction;
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
const noopCreateStellarWallet: CreateStellarWalletAction = () =>
  Promise.resolve(null);
const noopSignStellarHash: SignStellarHashAction = () =>
  Promise.reject(
    new Error("Privy não está configurado para assinatura Stellar."),
  );

export const disabledPrivyWalletAbstraction: PrivyWalletAbstraction = {
  hasPrivyConfigured: false,
  isUsingPrivy: false,
  ready: true,
  authenticated: false,
  user: null,
  walletAddress: null,
  shortWalletAddress: null,
  stellarWalletAddress: null,
  shortStellarWalletAddress: null,
  hasStellarWallet: false,
  createStellarWallet: noopCreateStellarWallet,
  signStellarHash: noopSignStellarHash,
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
  const { createWallet } = useCreateWallet();
  const { signRawHash } = useSignRawHash();
  const { hasPrivyConfigured, isUsingPrivy } = getPrivyWalletEnv();
  const walletAddress = privyWallets.wallets[0]?.address ?? null;
  const stellarWalletAddress = findLinkedWalletAddress(privy.user, "stellar");
  const shortWalletAddress = walletAddress
    ? formatShortWalletAddress(walletAddress)
    : null;
  const shortStellarWalletAddress = stellarWalletAddress
    ? formatShortWalletAddress(stellarWalletAddress)
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
      stellarWalletAddress,
      shortStellarWalletAddress,
      hasStellarWallet: Boolean(stellarWalletAddress),
      createStellarWallet: async () => {
        if (!hasPrivyConfigured || !isUsingPrivy) return null;
        if (!privy.authenticated) {
          privy.login();
          return null;
        }

        const existingAddress = findLinkedWalletAddress(privy.user, "stellar");
        if (existingAddress) return existingAddress;

        const created = await createWallet({ chainType: "stellar" });
        return created.wallet.address;
      },
      signStellarHash: async (hash, addressOverride) => {
        const address =
          addressOverride ?? findLinkedWalletAddress(privy.user, "stellar");
        if (!address) {
          throw new Error(
            "Crie uma carteira Stellar via Privy antes de assinar.",
          );
        }

        const signed = await signRawHash({
          address,
          chainType: "stellar",
          hash,
        });

        return signed.signature;
      },
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
      createWallet,
      signRawHash,
      shortWalletAddress,
      shortStellarWalletAddress,
      stellarWalletAddress,
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

function findLinkedWalletAddress(
  user: User | null,
  chainType: LinkedWalletAccount["chainType"],
): string | null {
  const wallet = user?.linkedAccounts.find(
    (account): account is LinkedWalletAccount =>
      account.type === "wallet" && account.chainType === chainType,
  );

  return wallet?.address ?? null;
}
