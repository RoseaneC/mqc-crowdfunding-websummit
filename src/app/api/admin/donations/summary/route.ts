import { demoProjects } from "../../../_lib/demoProjects";
import { getApiBaseUrl } from "../../../_lib/proxy";
import { calculateDonationPortfolioMetrics } from "../../../../../util/donationMetrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const metrics = calculateDonationPortfolioMetrics([...demoProjects]);
  const resetEnabled = isAdminResetEnabled();

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
    demoDonationCount: metrics.donationCount,
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
  });
}

function isAdminResetEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_ADMIN_RESET === "true"
  );
}
