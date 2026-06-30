export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SupportedCryptoAsset = "CELO";

type CryptoBrlCache = {
  asset: SupportedCryptoAsset;
  brl: number;
  updatedAt: string;
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const ratesCache = globalThis as typeof globalThis & {
  __ponteiaCryptoBrlRates?: Partial<
    Record<SupportedCryptoAsset, CryptoBrlCache>
  >;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const asset = normalizeAsset(url.searchParams.get("asset"));

  if (!asset) {
    return Response.json(
      {
        ok: false,
        error: "Asset nao suportado para cotacao em BRL.",
      },
      { status: 400 },
    );
  }

  const now = Date.now();
  const cache = ratesCache.__ponteiaCryptoBrlRates ?? {};
  const cached = cache[asset];

  if (cached && cached.expiresAt > now) {
    return Response.json({
      ok: true,
      asset,
      brl: cached.brl,
      source: "cache",
      updatedAt: cached.updatedAt,
    });
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=brl",
      {
        cache: "no-store",
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Cotacao indisponivel: ${response.status}`);
    }

    const data: unknown = await response.json();
    const brl = readCeloBrlPrice(data);

    if (!Number.isFinite(brl) || brl <= 0) {
      throw new Error("Cotacao CELO-BRL invalida.");
    }

    const updatedAt = new Date().toISOString();
    ratesCache.__ponteiaCryptoBrlRates = {
      ...cache,
      [asset]: {
        asset,
        brl,
        updatedAt,
        expiresAt: now + CACHE_TTL_MS,
      },
    };

    return Response.json({
      ok: true,
      asset,
      brl,
      source: "coingecko",
      updatedAt,
    });
  } catch (error) {
    if (cached) {
      return Response.json({
        ok: true,
        asset,
        brl: cached.brl,
        source: "stale-cache",
        updatedAt: cached.updatedAt,
      });
    }

    const message =
      error instanceof Error ? error.message : "Falha ao buscar cotacao.";

    return Response.json(
      {
        ok: false,
        asset,
        error: message,
      },
      { status: 502 },
    );
  }
}

function normalizeAsset(value: string | null): SupportedCryptoAsset | null {
  return value?.trim().toUpperCase() === "CELO" ? "CELO" : null;
}

function readCeloBrlPrice(value: unknown) {
  if (!isRecord(value)) return Number.NaN;

  const celo = value.celo;
  if (!isRecord(celo)) return Number.NaN;

  return typeof celo.brl === "number" ? celo.brl : Number.NaN;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
