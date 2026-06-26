import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  http,
  parseUnits,
  type Hash,
  type WalletClient,
} from "viem";
import { celo } from "viem/chains";
import {
  CELO_MAINNET_CHAIN_ID,
  getCeloConfig,
  isCeloUsdgloEnabled,
} from "./celoConfig";

export type UsdGloDonationInput = {
  projectId: string | number;
  amount: string | number;
  donorWallet: string;
  destinationAddress: string;
};

export type UsdGloPreparedTransfer = {
  chainId: number;
  tokenAddress: `0x${string}`;
  to: `0x${string}`;
  amountUnits: bigint;
  data: `0x${string}`;
};

export type UsdGloSubmittedDonation = {
  txHash: Hash;
  projectId: string | number;
  amount: string;
  asset: "USDGLO";
  network: "celo-mainnet";
  donorWallet: string;
  destinationAddress: string;
};

export function validateCeloWallet(value: string | null | undefined) {
  return /^0x[a-fA-F0-9]{40}$/.test(value?.trim() ?? "");
}

export function formatUsdGloAmount(value: bigint | string | number) {
  if (typeof value === "bigint") {
    return formatUnits(value, 18);
  }

  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function buildUsdGloTransfer(
  input: UsdGloDonationInput,
): UsdGloPreparedTransfer {
  const config = getCeloConfig();

  if (!isCeloUsdgloEnabled()) {
    throw new Error("USDGLO Celo Mainnet nao esta habilitado neste ambiente.");
  }

  if (!validateCeloWallet(input.donorWallet)) {
    throw new Error("Carteira doadora EVM invalida.");
  }

  if (!validateCeloWallet(input.destinationAddress)) {
    throw new Error("Carteira EVM do projeto invalida.");
  }

  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor USDGLO invalido.");
  }

  const amountUnits = parseUnits(String(input.amount), 18);
  const destinationAddress = input.destinationAddress as `0x${string}`;

  return {
    chainId: CELO_MAINNET_CHAIN_ID,
    tokenAddress: config.usdgloAddress,
    to: destinationAddress,
    amountUnits,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [destinationAddress, amountUnits],
    }),
  };
}

export async function submitUsdGloDonation(input: {
  walletClient: WalletClient;
  projectId: string | number;
  amount: string | number;
  donorWallet: `0x${string}`;
  destinationAddress: `0x${string}`;
}) {
  const prepared = buildUsdGloTransfer(input);
  const currentChainId = await input.walletClient.getChainId();

  if (currentChainId !== CELO_MAINNET_CHAIN_ID) {
    throw new Error(
      "Altere sua carteira EVM para Celo Mainnet (chainId 42220).",
    );
  }

  const hash = await input.walletClient.writeContract({
    address: prepared.tokenAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [prepared.to, prepared.amountUnits],
    account: input.donorWallet,
    chain: celo,
  });

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(getCeloConfig().rpcUrl),
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return {
    txHash: hash,
    projectId: input.projectId,
    amount: String(input.amount),
    asset: "USDGLO",
    network: "celo-mainnet",
    donorWallet: input.donorWallet,
    destinationAddress: input.destinationAddress,
  } satisfies UsdGloSubmittedDonation;
}
