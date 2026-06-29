"use client";

import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import {
  getPrivyWalletEnv,
  PrivyWalletAbstractionBridge,
} from "../hooks/usePrivyWalletAbstraction";

const privyConfig = {
  appearance: {
    theme: "light",
    accentColor: "#1A4A2E",
    landingHeader: "Ponteia",
    loginMessage: "Entre para apoiar projetos de impacto com seguranca.",
    walletChainType: "ethereum-only",
  },
  loginMethods: ["email", "google", "wallet"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
} satisfies PrivyClientConfig;

export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const { appId, hasPrivyConfigured } = getPrivyWalletEnv();

  if (!appId || !hasPrivyConfigured) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      <PrivyWalletAbstractionBridge>{children}</PrivyWalletAbstractionBridge>
    </PrivyProvider>
  );
}
