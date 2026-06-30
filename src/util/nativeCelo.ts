import type { EIP1193Provider } from "@privy-io/react-auth";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEther,
  type Hash,
} from "viem";
import { celo } from "viem/chains";
import { CELO_MAINNET_CHAIN_ID, getCeloConfig } from "./celoConfig";
import { validateCeloWallet } from "./usdgloCelo";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type NativeCeloTransferStatus =
  | "awaiting-signature"
  | "submitted"
  | "awaiting-confirmation";

export type NativeCeloTransferInput = {
  provider: EIP1193Provider;
  donorWallet: string;
  recipientWallet: string;
  amount: string | number;
  onStatus?: (status: NativeCeloTransferStatus) => void;
};

export type NativeCeloTransferResult = {
  txHash: Hash;
  asset: "CELO";
  network: "celo-mainnet";
  donorWallet: `0x${string}`;
  recipientWallet: `0x${string}`;
  amount: string;
};

export async function transferNativeCelo(
  input: NativeCeloTransferInput,
): Promise<NativeCeloTransferResult> {
  const config = getCeloConfig();
  const donorWallet = assertCeloAddress(input.donorWallet, "Carteira doadora");
  const recipientWallet = assertCeloAddress(
    input.recipientWallet,
    "Carteira recebedora",
  );
  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor de doacao invalido.");
  }

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(config.rpcUrl),
  });
  const walletClient = createWalletClient({
    account: donorWallet,
    chain: celo,
    transport: custom(input.provider),
  });
  const currentChainId = await walletClient.getChainId();

  if (currentChainId !== CELO_MAINNET_CHAIN_ID) {
    await walletClient.switchChain({ id: CELO_MAINNET_CHAIN_ID });
  }

  input.onStatus?.("awaiting-signature");

  const txHash = await walletClient.sendTransaction({
    account: donorWallet,
    chain: celo,
    to: recipientWallet,
    value: parseEther(String(input.amount)),
  });

  input.onStatus?.("submitted");
  input.onStatus?.("awaiting-confirmation");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  if (receipt.status !== "success") {
    throw new Error("Transacao recusada ou falhou.");
  }

  return {
    txHash,
    asset: "CELO",
    network: "celo-mainnet",
    donorWallet,
    recipientWallet,
    amount: String(input.amount),
  };
}

function assertCeloAddress(value: string, label: string): `0x${string}` {
  const normalized = value.trim();

  if (!validateCeloWallet(normalized) || normalized === ZERO_ADDRESS) {
    throw new Error(`${label} EVM invalida.`);
  }

  return normalized as `0x${string}`;
}
