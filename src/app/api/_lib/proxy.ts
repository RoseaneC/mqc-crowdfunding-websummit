import { demoProjects } from "./demoProjects";
import { getConfirmedDonationMetrics, listDonations } from "./donationStore";
import { calculateProjectDonationMetrics } from "../../../util/donationMetrics";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    },
  });
}

async function readRequestBody(request: Request) {
  const text = await request.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return text;
  }
}

export function getApiBaseUrl() {
  return (process.env.API_BASE_URL ?? "").replace(/\/$/, "");
}

function getDemoDonationMetrics() {
  return getConfirmedDonationMetrics();
}

function getProjectsWithDonationMetrics() {
  const metrics = getDemoDonationMetrics();

  return demoProjects.map((project) => {
    const projectMetrics = metrics.projects.find(
      (item) => String(item.projectId) === String(project.id),
    );

    return {
      ...project,
      raisedXlm: projectMetrics?.totalRaised ?? 0,
      raisedAsset: projectMetrics?.currency ?? project.moedaPrincipal,
      donationCount: projectMetrics?.donationCount ?? 0,
    };
  });
}

function getFallbackResponse(method: HttpMethod, path: string) {
  if (path === "/health" && method === "GET") {
    return json({
      ok: true,
      status: "ok",
      source: "local-fallback",
    });
  }

  if (path === "/contact-messages" && method === "POST") {
    return json(
      {
        ok: true,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        delivery: "demo",
        message:
          "Mensagem recebida em ambiente de demonstração. Configure API_BASE_URL ou um serviço de e-mail para envio real.",
        source: "local-demo-fallback",
      },
      201,
    );
  }

  if (path === "/projects" && method === "GET") {
    return json({
      data: getProjectsWithDonationMetrics(),
      source: "local-demo-fallback",
    });
  }

  if (path === "/projects" && method === "POST") {
    return json(
      {
        ok: true,
        message: "Projeto recebido em ambiente local.",
        source: "local-fallback",
      },
      201,
    );
  }

  if (path === "/catalog/project-media" && method === "GET") {
    return json([]);
  }

  if (path === "/catalog/project-nfts" && method === "GET") {
    return json([]);
  }

  if (path === "/catalog/nfts" && method === "GET") {
    return json([]);
  }

  if (path === "/transparency/summary" && method === "GET") {
    const metrics = getDemoDonationMetrics();

    return json({
      totalXlm: metrics.totalRaised,
      projectXlm: Math.round(metrics.totalRaised * 0.94),
      feeXlm: Math.round(metrics.totalRaised * 0.06),
      approvedProjects: demoProjects.length,
      uniqueDonors: metrics.uniqueDonors,
      recentImpacts: listDonations()
        .filter((donation) => donation.status === "confirmed")
        .slice(-5)
        .reverse()
        .map((donation) => ({
          id: donation.id,
          projectId: donation.projectId,
          projectName: donation.projectName,
          amountXlm: donation.asset === "XLM" ? donation.amount : 0,
          nftId: donation.nftId,
          walletAddress: donation.walletAddress,
          confirmedAt: donation.confirmedAt,
        })),
      source: "local-demo-fallback",
    });
  }

  if (path === "/admin/reports/summary" && method === "GET") {
    const metrics = getDemoDonationMetrics();

    return json({
      totalXlm: metrics.totalRaised,
      projectXlm: Math.round(metrics.totalRaised * 0.94),
      feeXlm: Math.round(metrics.totalRaised * 0.06),
      totalProjects: demoProjects.length,
      uniqueDonors: metrics.uniqueDonors,
      source: "local-demo-fallback",
    });
  }

  if (path === "/admin/dashboard" && method === "GET") {
    return json({
      activity: [],
      featuredProjects: getProjectsWithDonationMetrics().map((project) => {
        const projectMetrics = calculateProjectDonationMetrics(project);

        return {
          projectId: Number(project.id),
          title: project.title,
          ngoName: project.ngoName,
          status: project.status,
          raisedXlm: projectMetrics.totalRaised,
          targetXlm: projectMetrics.targetAmount,
          donors: projectMetrics.donationCount,
          createdAt: project.createdAt,
        };
      }),
      source: "local-demo-fallback",
    });
  }

  if (path === "/admin/reports" && method === "GET") {
    const metrics = getDemoDonationMetrics();

    return json({
      kpis: {
        totalCollectedXlm: metrics.totalRaised,
        activeDonors: metrics.uniqueDonors,
        fundedProjects: metrics.projects.filter(
          (project) => project.status === "funded",
        ).length,
        avgTicketXlm:
          metrics.donationCount > 0
            ? metrics.totalRaised / metrics.donationCount
            : 0,
      },
      distribution: [],
      topProjects: metrics.projects.map((project, index) => ({
        rank: index + 1,
        projectId: Number(project.projectId),
        name: project.projectTitle,
        incentive: project.status,
        totalProjectXlm: project.totalRaised,
      })),
      recentDonations: listDonations()
        .filter((donation) => donation.status === "confirmed")
        .slice(-20)
        .reverse()
        .map((donation) => ({
          id: donation.id,
          donorWallet: donation.walletAddress,
          project: donation.projectName,
          incentive: donation.network,
          confirmedAt: donation.confirmedAt ?? donation.createdAt,
          amountXlm: donation.asset === "XLM" ? donation.amount : 0,
          status: "CONFIRMED" as const,
          txHash: donation.txHash,
          nftId: donation.nftId,
        })),
      source: "local-demo-fallback",
    });
  }

  if (path === "/admin/projects/summary" && method === "GET") {
    return json({
      pending: 0,
      approved: demoProjects.length,
      rejected: 0,
      total_projects: demoProjects.length,
      source: "local-demo-fallback",
    });
  }

  if (path === "/admin/projects/pending" && method === "GET") {
    return json([]);
  }

  if (path === "/admin/projects/my" && method === "GET") {
    return json([]);
  }

  return json(
    {
      ok: false,
      error: "API route not implemented locally.",
      method,
      path,
    },
    404,
  );
}

export async function proxyToFastify(
  request: Request,
  method: HttpMethod,
  targetPath: string,
) {
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type, authorization",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
      },
    });
  }

  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return getFallbackResponse(method, targetPath);
  }

  const url = new URL(`${apiBaseUrl}${targetPath}`);
  const incomingUrl = new URL(request.url);

  incomingUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("authorization", authorization);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  headers.set("accept", "application/json");
  headers.set("accept-encoding", "identity");

  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : JSON.stringify(await readRequestBody(request));

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseText = await response.text();

    let data: JsonValue;

    try {
      data = JSON.parse(responseText) as JsonValue;
    } catch {
      data = {
        ok: response.ok,
        status: response.status,
        body: responseText,
      };
    }

    return json(data, response.status);
  } catch (error) {
    if (targetPath === "/projects" && method === "GET") {
      return json({
        data: getProjectsWithDonationMetrics(),
        source: "local-demo-fallback",
        warning:
          "API externa indisponível; exibindo dados de demonstração para manter a navegação pública.",
      });
    }

    return json(
      {
        ok: false,
        error: "Failed to proxy request.",
        targetUrl: url.toString(),
        message: error instanceof Error ? error.message : "Unknown error",
      },
      502,
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
