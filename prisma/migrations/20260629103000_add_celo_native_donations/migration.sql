-- Add CELO as a native donation asset on Celo Mainnet.
ALTER TYPE "DonationAsset" ADD VALUE IF NOT EXISTS 'CELO';
