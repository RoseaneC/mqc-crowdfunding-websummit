import { getDonationById, toDonationReceipt } from "../../_lib/donationStore";
import { getImpactDonationReceipt } from "../../_lib/projectStore";
import { getApiBaseUrl, proxyToFastify } from "../../_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  const { id } = await context.params;

  if (!getApiBaseUrl()) {
    const persistedDonation = await getImpactDonationReceipt(id);

    if (persistedDonation) {
      return Response.json(persistedDonation);
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
