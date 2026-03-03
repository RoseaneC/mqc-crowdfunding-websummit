import React, { createContext, useContext, useEffect, useState } from "react";
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
  timestamp: number;
  txHash?: string;
  nftId?: number;
  donorType: "PF" | "PJ";
  walletAddress: string;
}

interface DonationContextType {
  donations: Donation[];
  addDonation: (donation: Donation) => Promise<void>;
  getDonationById: (id: string) => Donation | undefined;
  refreshDonations: () => Promise<void>;
}

const DonationContext = createContext<DonationContextType | undefined>(
  undefined
);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [donations, setDonations] = useState<Donation[]>([]);

  const refreshDonations = async () => {
    if (!address) {
      setDonations([]);
      return;
    }
    try {
      const items = await listWalletDonations(address);
      const normalized = items.map(normalizeApiDonation);
      setDonations(normalized);
    } catch {
      // Keep UI responsive even if API is not reachable.
      setDonations([]);
    }
  };

  useEffect(() => {
    void refreshDonations();
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const addDonation = async () => {
    await refreshDonations();
  };

  const getDonationById = (id: string) => {
    return donations.find((d) => d.id === id);
  };

  return (
    <DonationContext.Provider
      value={{ donations, addDonation, getDonationById, refreshDonations }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonations() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonations must be used within DonationProvider");
  }
  return context;
}

function normalizeApiDonation(item: DonationReceiptDTO): Donation {
  const amount = Number(item.amountXlm);
  return {
    id: item.id,
    projectId: item.projectId,
    projectName: item.projectName,
    amount,
    amountBRL: (amount * 0.5432).toFixed(2),
    timestamp: new Date(item.createdAt).getTime(),
    txHash: item.txHash ?? undefined,
    nftId: item.nftId ?? undefined,
    donorType: item.donorType,
    walletAddress: item.walletAddress,
  };
}
