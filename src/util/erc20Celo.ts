import type { EIP1193Provider } from "@privy-io/react-auth";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
  type Hash,
} from "viem";
import { celo } from "viem/chains";
import {
  CELO_MAINNET_CHAIN_ID,
  getCeloConfig,
  isCeloUsdgloEnabled,
} from "./celoConfig";
import { validateCeloWallet } from "./usdgloCelo";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const erc20TransferAbi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type CeloErc20Asset = "USDGLO";

export type CeloErc20TransferStatus =
  | "awaiting-signature"
  | "submitted"
  | "awaiting-confirmation";

export type CeloErc20TransferInput = {
  asset: CeloErc20Asset;
  provider: EIP1193Provider;
  donorWallet: string;
  recipientWallet: string;
  amount: string | number;
  onStatus?: (status: CeloErc20TransferStatus) => void;
};

export type CeloErc20TransferResult = {
  txHash: Hash;
  asset: CeloErc20Asset;
  network: "celo-mainnet";
  donorWallet: `0x${string}`;
  recipientWallet: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
};

export async function transferCeloErc20(
  input: CeloErc20TransferInput,
): Promise<CeloErc20TransferResult> {
  const config = getCeloConfig();
  const donorWallet = assertCeloAddress(input.donorWallet, "Carteira doadora");
  const recipientWallet = assertCeloAddress(
    input.recipientWallet,
    "Carteira recebedora",
  );
  const tokenAddress = getTokenAddress(input.asset);
  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor de doação inválido.");
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

  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20TransferAbi,
    functionName: "decimals",
  });
  const parsedAmount = parseUnits(String(input.amount), decimals);

  input.onStatus?.("awaiting-signature");

  const txHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: erc20TransferAbi,
    functionName: "transfer",
    args: [recipientWallet, parsedAmount],
    account: donorWallet,
    chain: celo,
  });

  input.onStatus?.("submitted");
  input.onStatus?.("awaiting-confirmation");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  if (receipt.status !== "success") {
    throw new Error("Transação recusada ou falhou.");
  }

  return {
    txHash,
    asset: input.asset,
    network: "celo-mainnet",
    donorWallet,
    recipientWallet,
    tokenAddress,
    amount: String(input.amount),
  };
}

function getTokenAddress(asset: CeloErc20Asset): `0x${string}` {
  const config = getCeloConfig();

  if (asset === "USDGLO") {
    if (!isCeloUsdgloEnabled()) {
      throw new Error("USDGLO na Celo Mainnet não está habilitado.");
    }

    return assertCeloAddress(config.usdgloAddress, "Contrato USDGLO");
  }

  throw new Error("Ativo não suportado para doação real.");
}

function assertCeloAddress(value: string, label: string): `0x${string}` {
  const normalized = value.trim();

  if (!validateCeloWallet(normalized) || normalized === ZERO_ADDRESS) {
    throw new Error(`${label} EVM inválida.`);
  }

  return normalized as `0x${string}`;
}
