import { getDonationById, toDonationReceipt } from "../../_lib/donationStore";
import {
  canUseMemoryFallback,
  getImpactDonationReceipt,
} from "../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  const { id } = await context.params;

  if (!getApiBaseUrl()) {
    const persistedDonation = await getImpactDonationReceipt(id).catch(
      (error: unknown) => {
        if (isDatabaseUnavailableError(error)) {
          return "database-unavailable" as const;
        }

        console.error("[donations-receipt] Receipt lookup failed.", {
          message: error instanceof Error ? error.message : "Unknown error",
        });

        return "lookup-failed" as const;
      },
    );

    if (persistedDonation === "database-unavailable") {
      return Response.json(
        {
          ok: false,
          error:
            "Banco de dados indisponivel. Nao foi possivel carregar o comprovante.",
        },
        { status: 503 },
      );
    }

    if (persistedDonation === "lookup-failed") {
      return Response.json(
        {
          ok: false,
          error: "Nao foi possivel carregar o comprovante.",
        },
        { status: 500 },
      );
    }

    if (persistedDonation) {
      return Response.json(persistedDonation);
    }

    if (!canUseMemoryFallback()) {
      return Response.json(
        {
          ok: false,
          error: "Doacao nao encontrada.",
        },
        { status: 404 },
      );
    }

    const donation = getDonationById(id);

    if (!donation) {
      return Response.json(
        {
          ok: false,
          error: "Doacao nao encontrada.",
        },
        { status: 404 },
      );
    }

    return Response.json(toDonationReceipt(donation));
  }

  return proxyToFastify(request, "GET", `/donations/${id}`);
}

function isDatabaseUnavailableError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Banco de dados indisponivel")
  );
}
