export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AwesomeApiUsdBrlResponse = {
  USDBRL?: {
    bid?: string;
  };
};

type UsdBrlCache = {
  rate: number;
  updatedAt: string;
  expiresAt: number;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const ratesCache = globalThis as typeof globalThis & {
  __ponteiaUsdBrlRate?: UsdBrlCache;
};

export async function GET() {
  const now = Date.now();
  const cached = ratesCache.__ponteiaUsdBrlRate;

  if (cached && cached.expiresAt > now) {
    return Response.json({
      ok: true,
      rate: cached.rate,
      updatedAt: cached.updatedAt,
      source: "cache",
    });
  }

  try {
    const response = await fetch(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Cotacao indisponivel: ${response.status}`);
    }

    const data = (await response.json()) as AwesomeApiUsdBrlResponse;
    const rate = Number(data.USDBRL?.bid);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Cotacao USD-BRL invalida.");
    }

    const updatedAt = new Date().toISOString();
    ratesCache.__ponteiaUsdBrlRate = {
      rate,
      updatedAt,
      expiresAt: now + CACHE_TTL_MS,
    };

    return Response.json({
      ok: true,
      rate,
      updatedAt,
      source: "awesomeapi",
    });
  } catch (error) {
    if (cached) {
      return Response.json({
        ok: true,
        rate: cached.rate,
        updatedAt: cached.updatedAt,
        source: "stale-cache",
      });
    }

    const message =
      error instanceof Error ? error.message : "Falha ao buscar cotacao.";

    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 502 },
    );
  }
}
