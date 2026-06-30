import {
  listDonationsByWallet,
  toDonationReceipt,
} from "../../../_lib/donationStore";
import {
  canUseMemoryFallback,
  listImpactDonationsByWallet,
} from "../../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ wallet: string }> };

export async function GET(request: Request, context: Ctx) {
  const { wallet } = await context.params;

  if (!getApiBaseUrl()) {
    const persistedDonations = await listImpactDonationsByWallet(wallet).catch(
      (error: unknown) => {
        if (isDatabaseUnavailableError(error)) {
          return "database-unavailable" as const;
        }

        console.error("[wallet-donations] Wallet history lookup failed.", {
          message: error instanceof Error ? error.message : "Unknown error",
        });

        return "lookup-failed" as const;
      },
    );

    if (persistedDonations === "database-unavailable") {
      return Response.json(
        {
          ok: false,
          error:
            "Banco de dados indisponivel. Nao foi possivel carregar o historico.",
        },
        { status: 503 },
      );
    }

    if (persistedDonations === "lookup-failed") {
      return Response.json(
        {
          ok: false,
          error: "Nao foi possivel carregar o historico.",
        },
        { status: 500 },
      );
    }

    if (!canUseMemoryFallback()) {
      return Response.json(persistedDonations);
    }

    return Response.json(
      listDonationsByWallet(wallet).map((donation) =>
        toDonationReceipt(donation),
      ),
    );
  }

  return proxyToFastify(
    request,
    "GET",
    `/users/${encodeURIComponent(wallet)}/donations`,
  );
}

function isDatabaseUnavailableError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Banco de dados indisponivel")
  );
}
