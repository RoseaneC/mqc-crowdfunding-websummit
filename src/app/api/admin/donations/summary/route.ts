import {
  getConfirmedDonationMetrics,
  listDonations,
} from "../../../_lib/donationStore";
import { requireAdmin } from "../../../_lib/adminAuth";
import { getApiBaseUrl } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl) {
    const url = new URL(`${apiBaseUrl}/admin/donations/summary`);
    const authorization = request.headers.get("authorization");

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(authorization ? { authorization } : {}),
        },
        cache: "no-store",
      });
      const data: unknown = await response.json();

      return Response.json(data, { status: response.status });
    } catch (error) {
      return Response.json(
        {
          ok: false,
          error: "Failed to load donation summary from configured API.",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 502 },
      );
    }
  }

  const metrics = getConfirmedDonationMetrics();
  const resetEnabled = isAdminResetEnabled();
  const donations = listDonations();

  return Response.json({
    ok: true,
    source: "local-demo-fallback",
    environmentStatus:
      process.env.NODE_ENV === "production" ? "production" : "demo",
    resetEnabled,
    resetMessage: resetEnabled
      ? "Reset administrativo autorizado para este ambiente."
      : "Reset administrativo disponivel apenas em ambiente autorizado.",
    totalRaised: metrics.totalRaised,
    donationCount: metrics.donationCount,
    demoDonationCount: donations.filter(
      (donation) => donation.network !== "stellar-mainnet",
    ).length,
    uniqueDonors: metrics.uniqueDonors,
    lastUpdated: metrics.lastUpdated,
    projects: metrics.projects.map((project) => ({
      projectId: project.projectId,
      title: project.projectTitle,
      totalRaised: project.totalRaised,
      donationCount: project.donationCount,
      progressPercent: project.progressPercent,
      currency: project.currency,
      status: project.status,
    })),
    recentDonations: donations
      .filter((donation) => donation.status === "confirmed")
      .slice(-20)
      .reverse()
      .map((donation) => ({
        id: donation.id,
        projectId: donation.projectId,
        projectName: donation.projectName,
        amount: donation.amount,
        asset: donation.asset,
        network: donation.network,
        txHash: donation.txHash,
        status: donation.status,
        createdAt: donation.createdAt,
        walletAddress: donation.walletAddress,
      })),
  });
}

function isAdminResetEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_ADMIN_RESET === "true"
  );
}
