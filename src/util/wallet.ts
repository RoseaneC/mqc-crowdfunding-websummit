import storage from "./storage";
import {
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  sep43Modules,
} from "@creit.tech/stellar-wallets-kit";
import { Horizon } from "@stellar/stellar-sdk";
import { networkPassphrase, stellarNetwork } from "../contracts/util";

let kitInstance: StellarWalletsKit | null = null;

function getWalletKit() {
  if (typeof window === "undefined") {
    throw new Error("Wallet kit is only available in the browser.");
  }
  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: networkPassphrase as WalletNetwork,
      modules: sep43Modules(),
    });
  }
  return kitInstance;
}

export const connectWallet = async () => {
  const kit = getWalletKit();
  await kit.openModal({
    modalTitle: "Connect to your wallet",
    onWalletSelected: (option: ISupportedWallet) => {
      const selectedId = option.id;
      kit.setWallet(selectedId);

      void kit.getAddress().then((address) => {
        if (address.address) {
          storage.setItem("walletId", selectedId);
          storage.setItem("walletAddress", address.address);
          window.dispatchEvent(new Event("wallet:changed"));
        } else {
          storage.setItem("walletId", "");
          storage.setItem("walletAddress", "");
          window.dispatchEvent(new Event("wallet:changed"));
        }
      });
      if (selectedId == "freighter" || selectedId == "hot-wallet") {
        void kit.getNetwork().then((network) => {
          if (network.network && network.networkPassphrase) {
            storage.setItem("walletNetwork", network.network);
            storage.setItem("networkPassphrase", network.networkPassphrase);
            window.dispatchEvent(new Event("wallet:changed"));
          } else {
            storage.setItem("walletNetwork", "");
            storage.setItem("networkPassphrase", "");
            window.dispatchEvent(new Event("wallet:changed"));
          }
        });
      }
    },
  });
};

export const disconnectWallet = async () => {
  await getWalletKit().disconnect();
  storage.removeItem("walletId");
  storage.removeItem("walletAddress");
  storage.removeItem("walletNetwork");
  storage.removeItem("networkPassphrase");
  window.dispatchEvent(new Event("wallet:changed"));
};

export const setWallet = (walletId: string) => {
  getWalletKit().setWallet(walletId);
};

export const getAddress = () => getWalletKit().getAddress();

export const getNetwork = () => getWalletKit().getNetwork();

export const signTransaction: StellarWalletsKit["signTransaction"] = (
  ...args
) => getWalletKit().signTransaction(...args);

function getHorizonHost(mode: string) {
  switch (mode) {
    case "LOCAL":
      return "http://localhost:8000";
    case "FUTURENET":
      return "https://horizon-futurenet.stellar.org";
    case "TESTNET":
      return "https://horizon-testnet.stellar.org";
    case "PUBLIC":
      return "https://horizon.stellar.org";
    default:
      throw new Error(`Unknown Stellar network: ${mode}`);
  }
}

const horizon = new Horizon.Server(getHorizonHost(stellarNetwork), {
  allowHttp: stellarNetwork === "LOCAL",
});

const formatter = new Intl.NumberFormat();

export type MappedBalances = Record<string, Horizon.HorizonApi.BalanceLine>;

export const fetchBalances = async (address: string) => {
  try {
    const { balances } = await horizon.accounts().accountId(address).call();
    const mapped = balances.reduce((acc, b) => {
      b.balance = formatter.format(Number(b.balance));
      const key =
        b.asset_type === "native"
          ? "xlm"
          : b.asset_type === "liquidity_pool_shares"
            ? b.liquidity_pool_id
            : `${b.asset_code}:${b.asset_issuer}`;
      acc[key] = b;
      return acc;
    }, {} as MappedBalances);
    return mapped;
  } catch (err) {
    if (!(err instanceof Error && err.message.match(/not found/i))) {
      console.error(err);
    }
    return {};
  }
};
