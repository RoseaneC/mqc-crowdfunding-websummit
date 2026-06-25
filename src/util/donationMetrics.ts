export type DonationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE"
  | (string & {});

export type DonationMetricProject = {
  id: number | string;
  title?: string;
  ngoName?: string;
  targetXlm?: number | string | null;
  raisedXlm?: number | string | null;
  raisedAsset?: string | null;
  status?: DonationStatus;
  moedaPrincipal?: string | null;
};

export type DonationMetricRecord = {
  id?: number | string;
  projectId: number | string;
  amountXlm?: number | string | null;
  amount?: number | string | null;
  asset?: string | null;
  status?: DonationStatus;
  walletAddress?: string | null;
  isDemo?: boolean;
  source?: string | null;
};

export type ProjectDonationMetrics = {
  projectId: number | string;
  projectTitle: string;
  ngoName: string;
  totalRaised: number;
  donationCount: number;
  targetAmount: number;
  progressPercent: number;
  currency: string;
  status: "empty" | "active" | "funded" | "inactive";
};

export type DonationPortfolioMetrics = {
  totalRaised: number;
  donationCount: number;
  uniqueDonors: number;
  currency: string;
  projects: ProjectDonationMetrics[];
  lastUpdated: string;
};

export function calculateProjectDonationMetrics(
  project: DonationMetricProject,
  donations?: DonationMetricRecord[],
): ProjectDonationMetrics {
  const matchingDonations = donations?.filter((donation) => {
    return (
      String(donation.projectId) === String(project.id) &&
      isConfirmedDonation(donation) &&
      !isDemoDonation(donation)
    );
  });

  const totalRaised = matchingDonations
    ? matchingDonations.reduce(
        (total, donation) => total + getDonationAmount(donation),
        0,
      )
    : normalizeAmount(project.raisedXlm);
  const donationAssets = [
    ...new Set(
      matchingDonations
        ?.map((donation) => donation.asset?.trim().toUpperCase())
        .filter((asset): asset is string => Boolean(asset)) ?? [],
    ),
  ];

  const targetAmount = normalizeAmount(project.targetXlm);
  const progressPercent =
    targetAmount > 0
      ? Math.min(100, Math.round((totalRaised / targetAmount) * 100))
      : 0;

  return {
    projectId: project.id,
    projectTitle: project.title ?? `Projeto #${project.id}`,
    ngoName: project.ngoName ?? "",
    totalRaised,
    donationCount: matchingDonations?.length ?? 0,
    targetAmount,
    progressPercent,
    currency:
      donationAssets.length === 1
        ? donationAssets[0]
        : project.raisedAsset?.trim().toUpperCase() ||
          project.moedaPrincipal ||
          "USDC",
    status: getCampaignStatus(project.status, totalRaised, targetAmount),
  };
}

export function calculateDonationPortfolioMetrics(
  projects: DonationMetricProject[],
  donations?: DonationMetricRecord[],
): DonationPortfolioMetrics {
  const projectMetrics = projects.map((project) =>
    calculateProjectDonationMetrics(project, donations),
  );
  const eligibleDonations =
    donations?.filter(
      (donation) => isConfirmedDonation(donation) && !isDemoDonation(donation),
    ) ?? [];
  const donorWallets = new Set(
    eligibleDonations
      .map((donation) => donation.walletAddress?.trim())
      .filter((wallet): wallet is string => Boolean(wallet)),
  );

  return {
    totalRaised: projectMetrics.reduce(
      (total, project) => total + project.totalRaised,
      0,
    ),
    donationCount:
      donations === undefined
        ? projectMetrics.reduce(
            (total, project) => total + project.donationCount,
            0,
          )
        : eligibleDonations.length,
    uniqueDonors: donorWallets.size,
    currency: projectMetrics[0]?.currency ?? "USDC",
    projects: projectMetrics,
    lastUpdated: new Date().toISOString(),
  };
}

export function formatDonationAmount(value: number | string) {
  return normalizeAmount(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDonationProgress(value: number | string) {
  return `${Math.min(100, Math.max(0, Math.round(normalizeAmount(value))))}%`;
}

export function getDonationCampaignMessage(metrics: ProjectDonationMetrics) {
  if (metrics.totalRaised <= 0 || metrics.donationCount <= 0) {
    return "Campanha aberta para primeiras contribuições";
  }

  return `${metrics.donationCount.toLocaleString("pt-BR")} contribuição${
    metrics.donationCount === 1 ? "" : "ões"
  } registrada${metrics.donationCount === 1 ? "" : "s"}`;
}

export function normalizeAmount(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function getDonationAmount(donation: DonationMetricRecord) {
  return normalizeAmount(donation.amountXlm ?? donation.amount);
}

function isConfirmedDonation(donation: DonationMetricRecord) {
  return !donation.status || donation.status === "CONFIRMED";
}

function isDemoDonation(donation: DonationMetricRecord) {
  return (
    donation.isDemo === true ||
    donation.source === "demo" ||
    donation.source === "test" ||
    donation.source === "homologation" ||
    donation.source === "stellar-testnet"
  );
}

function getCampaignStatus(
  projectStatus: DonationStatus | undefined,
  totalRaised: number,
  targetAmount: number,
): ProjectDonationMetrics["status"] {
  if (projectStatus === "INACTIVE" || projectStatus === "REJECTED") {
    return "inactive";
  }

  if (targetAmount > 0 && totalRaised >= targetAmount) {
    return "funded";
  }

  return totalRaised > 0 ? "active" : "empty";
}
