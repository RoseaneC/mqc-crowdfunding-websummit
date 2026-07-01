import {
  getConfirmedDonationMetrics,
  resetDemoDonations,
} from "../../../_lib/donationStore";
import { requireAdmin } from "../../../_lib/adminAuth";
import { getApiBaseUrl } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESET_CONFIRMATION = "ZERAR_DOACOES_TESTE";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  if (!isAdminResetEnabled()) {
    return Response.json(
      {
        ok: false,
        error: "Reset administrativo disponivel apenas em ambiente autorizado.",
      },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    confirm?: string;
  } | null;

  if (body?.confirm !== RESET_CONFIRMATION) {
    return Response.json(
      {
        ok: false,
        error: `Confirmacao invalida. Envie confirm="${RESET_CONFIRMATION}".`,
      },
      { status: 400 },
    );
  }

  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl) {
    return resetConfiguredApi(request, apiBaseUrl, {
      confirm: RESET_CONFIRMATION,
    });
  }

  const before = getConfirmedDonationMetrics();
  const projectsAffected = before.projects.filter(
    (project) => project.totalRaised > 0 || project.donationCount > 0,
  );
  const resetResult = resetDemoDonations();

  console.info(
    "[admin-reset-demo-donations] Local demo reset requested. Demo donation metrics are zeroed in source data.",
    {
      totalBeforeReset: before.totalRaised,
      recordsRemovedOrZeroed: resetResult.removed,
    },
  );

  return Response.json({
    ok: true,
    source: "local-demo-fallback",
    message:
      "Dados locais de demonstracao ja estao zerados. Nenhum projeto, usuario ou configuracao foi removido.",
    projectsAffected: projectsAffected.map((project) => ({
      projectId: project.projectId,
      title: project.projectTitle,
      previousTotal: project.totalRaised,
      afterTotal: 0,
    })),
    totalBeforeReset: before.totalRaised,
    totalAfterReset: 0,
    recordsRemovedOrZeroed: resetResult.removed,
    localStorageKeysToClear: ["donation", "donations", "doacao"],
    lastUpdated: new Date().toISOString(),
  });
}

async function resetConfiguredApi(
  request: Request,
  apiBaseUrl: string,
  body: { confirm: string },
) {
  const authorization = request.headers.get("authorization");

  try {
    const response = await fetch(`${apiBaseUrl}/admin/donations/reset-demo`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...(authorization ? { authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const responseBody: unknown = await response.json().catch(() => ({
      ok: response.ok,
      status: response.status,
    }));

    if (response.ok) {
      console.info("[admin-reset-demo-donations] Configured API reset done.", {
        status: response.status,
      });
    }

    return Response.json(responseBody, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          "Falha ao acionar reset no backend configurado. Nenhum reset local foi executado.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}

function isAdminResetEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_ADMIN_RESET === "true"
  );
}
