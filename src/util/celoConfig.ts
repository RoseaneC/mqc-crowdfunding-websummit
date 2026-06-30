export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_MAINNET_RPC_URL = "https://forno.celo.org";
export const USDGLO_CELO_ADDRESS = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3";

export type CeloConfig = {
  enabled: boolean;
  chainId: number;
  rpcUrl: string;
  usdgloAddress: `0x${string}`;
  usdcEnabled: boolean;
  usdcAddress: `0x${string}` | null;
};

export function getCeloConfig(): CeloConfig {
  const chainId = Number(
    process.env.NEXT_PUBLIC_CELO_CHAIN_ID ?? CELO_MAINNET_CHAIN_ID,
  );
  const rpcUrl =
    process.env.NEXT_PUBLIC_CELO_RPC_URL?.trim() || CELO_MAINNET_RPC_URL;
  const usdgloAddress = (
    process.env.NEXT_PUBLIC_USDGLO_CELO_ADDRESS?.trim() || USDGLO_CELO_ADDRESS
  ).toLowerCase();
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_CELO_ADDRESS?.trim() ?? "";
  const enabled = process.env.NEXT_PUBLIC_ENABLE_CELO_USDGLO === "true";
  const usdcEnabled =
    process.env.NEXT_PUBLIC_ENABLE_CELO_USDC === "true" &&
    /^0x[a-fA-F0-9]{40}$/.test(usdcAddress);

  return {
    enabled,
    chainId,
    rpcUrl,
    usdgloAddress: usdgloAddress as `0x${string}`,
    usdcEnabled,
    usdcAddress: usdcEnabled
      ? (usdcAddress.toLowerCase() as `0x${string}`)
      : null,
  };
}

export function isCeloUsdgloEnabled() {
  const config = getCeloConfig();

  return (
    config.enabled &&
    config.chainId === CELO_MAINNET_CHAIN_ID &&
    config.rpcUrl.length > 0 &&
    config.usdgloAddress.toLowerCase() === USDGLO_CELO_ADDRESS
  );
}

export function isCeloUsdcEnabled() {
  const config = getCeloConfig();

  return (
    config.usdcEnabled &&
    config.chainId === CELO_MAINNET_CHAIN_ID &&
    config.rpcUrl.length > 0 &&
    Boolean(config.usdcAddress)
  );
}

export function isNativeCeloEnabled() {
  const config = getCeloConfig();

  return config.chainId === CELO_MAINNET_CHAIN_ID && config.rpcUrl.length > 0;
}
