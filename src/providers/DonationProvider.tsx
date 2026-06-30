import React, { createContext, use, useEffect, useState } from "react";
import { usePrivyWalletAbstraction } from "../hooks/usePrivyWalletAbstraction";
import { useWallet } from "../hooks/useWallet";
import {
  listWalletDonations,
  type DonationReceiptDTO,
} from "../util/crowdfundingApi";

interface Donation {
  id: string | number;
  projectId: string | number;
  projectName: string;
  amount: string | number; // XLM amount
  amountBRL: string | number;
  asset?: string;
  network?: string;
  timestamp: number;
  txHash?: string;
  nftId?: number;
  status?: "PENDING" | "CONFIRMED" | "FAILED";
  donorType: "PF" | "PJ";
  walletAddress: string;
  destinationAddress?: string;
}

interface DonationContextType {
  donations: Donation[];
  addDonation: (donation: Donation) => Promise<void>;
  getDonationById: (id: string) => Donation | undefined;
  refreshDonations: () => Promise<void>;
}

const DonationContext = createContext<DonationContextType | undefined>(
  undefined,
);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const privyWallet = usePrivyWalletAbstraction();
  const [donations, setDonations] = useState<Donation[]>([]);
  const activeWalletAddress = privyWallet.evmAddress ?? address;

  const refreshDonations = async () => {
    if (!activeWalletAddress) {
      setDonations([]);
      return;
    }
    try {
      const items = await listWalletDonations(activeWalletAddress);
      const normalized = items
        .filter((item) => item.status === "CONFIRMED")
        .map(normalizeApiDonation);
      setDonations(normalized);
    } catch {
      // Keep UI responsive even if API is not reachable.
      setDonations([]);
    }
  };

  useEffect(() => {
    void refreshDonations();
  }, [activeWalletAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const addDonation = async () => {
    await refreshDonations();
  };

  const getDonationById = (id: string) => {
    return donations.find((d) => d.id === id);
  };

  return (
    <DonationContext
      value={{ donations, addDonation, getDonationById, refreshDonations }}
    >
      {children}
    </DonationContext>
  );
}

export function useDonations() {
  const context = use(DonationContext);
  if (!context) {
    throw new Error("useDonations must be used within DonationProvider");
  }
  return context;
}

function normalizeApiDonation(item: DonationReceiptDTO): Donation {
  const amount = Number(item.amount ?? item.amountXlm);
  const projectId = Number(item.projectId);
  const nftId =
    item.nftId === null || item.nftId === undefined
      ? undefined
      : Number(item.nftId);
  return {
    id: Number(item.id),
    projectId: Number.isFinite(projectId) ? projectId : item.projectId,
    projectName: item.projectName,
    amount,
    amountBRL: item.asset === "BRZ" || item.asset === "PIX" ? amount : 0,
    asset: item.asset,
    network: item.network,
    timestamp: new Date(item.createdAt).getTime(),
    txHash: item.txHash ?? undefined,
    nftId: Number.isFinite(nftId) ? nftId : undefined,
    status: item.status,
    donorType: item.donorType,
    walletAddress: item.walletAddress,
    destinationAddress: item.destinationAddress ?? undefined,
  };
}
