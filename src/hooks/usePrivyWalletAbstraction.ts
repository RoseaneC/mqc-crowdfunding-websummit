"use client";

import {
  createContext,
  createElement,
  use,
  useMemo,
  type ReactNode,
} from "react";
import {
  usePrivy,
  useWallets,
  type ConnectedWallet,
  type EIP1193Provider,
  type User,
} from "@privy-io/react-auth";
import {
  useCreateWallet,
  useSignRawHash,
} from "@privy-io/react-auth/extended-chains";

type WalletAction = () => void | Promise<void>;
type GetEvmProviderAction = () => Promise<EIP1193Provider | null>;
type SwitchEvmChainAction = (chainId: number) => Promise<void>;
type CreateStellarWalletAction = () => Promise<string | null>;
type SignStellarHashAction = (
  hash: `0x${string}`,
  addressOverride?: string,
) => Promise<`0x${string}`>;
export type PrivyActiveWalletType = "evm" | "stellar" | "none";
type LinkedAccount = User["linkedAccounts"][number];
type LinkedWalletAccount = Extract<LinkedAccount, { type: "wallet" }>;

export type PrivyWalletAbstraction = {
  hasPrivyConfigured: boolean;
  isUsingPrivy: boolean;
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  evmAddress: string | null;
  shortEvmAddress: string | null;
  stellarAddress: string | null;
  shortStellarAddress: string | null;
  activeWalletType: PrivyActiveWalletType;
  hasStellarWallet: boolean;
  canSignStellarHash: boolean;
  createStellarWallet: CreateStellarWalletAction;
  signStellarHash: SignStellarHashAction;
  walletAddress: string | null;
  shortWalletAddress: string | null;
  stellarWalletAddress: string | null;
  shortStellarWalletAddress: string | null;
  login: WalletAction;
  logout: WalletAction;
  connectWallet: WalletAction;
  getEvmProvider: GetEvmProviderAction;
  switchEvmChain: SwitchEvmChainAction;
};

export type PrivyWalletEnv = {
  appId: string | null;
  hasPrivyConfigured: boolean;
  isUsingPrivy: boolean;
};

const noopWalletAction: WalletAction = () => undefined;
const noopGetEvmProvider: GetEvmProviderAction = () => Promise.resolve(null);
const noopSwitchEvmChain: SwitchEvmChainAction = () => Promise.resolve();
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
  evmAddress: null,
  shortEvmAddress: null,
  stellarAddress: null,
  shortStellarAddress: null,
  activeWalletType: "none",
  hasStellarWallet: false,
  canSignStellarHash: false,
  createStellarWallet: noopCreateStellarWallet,
  signStellarHash: noopSignStellarHash,
  walletAddress: null,
  shortWalletAddress: null,
  stellarWalletAddress: null,
  shortStellarWalletAddress: null,
  login: noopWalletAction,
  logout: noopWalletAction,
  connectWallet: noopWalletAction,
  getEvmProvider: noopGetEvmProvider,
  switchEvmChain: noopSwitchEvmChain,
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
  const evmAddress =
    privyWallets.wallets.find((wallet) => wallet.type === "ethereum")
      ?.address ??
    findLinkedWalletAddress(privy.user, "ethereum") ??
    null;
  const stellarAddress = findLinkedWalletAddress(privy.user, "stellar");
  const shortEvmAddress = evmAddress
    ? formatShortWalletAddress(evmAddress)
    : null;
  const shortStellarAddress = stellarAddress
    ? formatShortWalletAddress(stellarAddress)
    : null;
  const activeWalletType: PrivyActiveWalletType = stellarAddress
    ? "stellar"
    : evmAddress
      ? "evm"
      : "none";

  const value = useMemo<PrivyWalletAbstraction>(
    () => ({
      hasPrivyConfigured,
      isUsingPrivy,
      ready: privy.ready && privyWallets.ready,
      authenticated: privy.authenticated,
      user: privy.user,
      evmAddress,
      shortEvmAddress,
      stellarAddress,
      shortStellarAddress,
      activeWalletType,
      hasStellarWallet: Boolean(stellarAddress),
      canSignStellarHash: Boolean(stellarAddress && isUsingPrivy),
      walletAddress: evmAddress,
      shortWalletAddress: shortEvmAddress,
      stellarWalletAddress: stellarAddress,
      shortStellarWalletAddress: shortStellarAddress,
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
      logout: async () => {
        for (const wallet of privyWallets.wallets) {
          wallet.disconnect();
        }
        clearLegacyWalletSession();
        await privy.logout();
      },
      connectWallet: () => {
        if (privy.authenticated) {
          privy.connectWallet();
          return;
        }

        privy.login();
      },
      getEvmProvider: async () => {
        const wallet = getConnectedEvmWallet(privyWallets.wallets);

        if (!wallet) return null;

        return wallet.getEthereumProvider();
      },
      switchEvmChain: async (chainId) => {
        const wallet = getConnectedEvmWallet(privyWallets.wallets);

        if (!wallet) {
          throw new Error("Carteira EVM não conectada.");
        }

        await wallet.switchChain(chainId);
      },
    }),
    [
      hasPrivyConfigured,
      isUsingPrivy,
      privy,
      privyWallets.ready,
      createWallet,
      signRawHash,
      activeWalletType,
      evmAddress,
      privyWallets.wallets,
      shortEvmAddress,
      shortStellarAddress,
      stellarAddress,
    ],
  );

  return createElement(
    PrivyWalletAbstractionContext.Provider,
    { value },
    children,
  );
}

function getConnectedEvmWallet(
  wallets: Array<ConnectedWallet>,
): ConnectedWallet | null {
  return wallets.find((wallet) => wallet.type === "ethereum") ?? null;
}

export function usePrivyWalletAbstraction(): PrivyWalletAbstraction {
  return use(PrivyWalletAbstractionContext);
}

function formatShortWalletAddress(value: string): string {
  if (value.length <= 14) return value;

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function clearLegacyWalletSession() {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("walletId", "");
  window.localStorage.setItem("walletAddress", "");
  window.localStorage.setItem("walletNetwork", "");
  window.localStorage.setItem("networkPassphrase", "");
  window.dispatchEvent(new Event("wallet:changed"));
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
