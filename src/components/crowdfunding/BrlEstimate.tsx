"use client";

import { useEffect, useMemo, useState } from "react";

type RateResponse = {
  ok: boolean;
  rate?: number;
};

type CryptoRateResponse = {
  ok: boolean;
  asset?: string;
  brl?: number;
};

type EstimateAsset = "USDGLO" | "USDC" | "CELO" | "PIX" | "BRZ";

export function BrlEstimate(props: { amount: number; asset: EstimateAsset }) {
  const [rate, setRate] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const isUsdStableAsset = props.asset === "USDGLO" || props.asset === "USDC";
  const shouldFetchRate = isUsdStableAsset || props.asset === "CELO";

  useEffect(() => {
    let active = true;

    async function loadRate() {
      if (!shouldFetchRate) {
        setRate(null);
        setUnavailable(false);
        return;
      }

      const endpoint = isUsdStableAsset
        ? "/api/rates/usd-brl"
        : "/api/rates/crypto-brl?asset=CELO";

      try {
        setUnavailable(false);
        const response = await fetch(endpoint, {
          cache: "no-store",
        });
        const data = (await response.json()) as
          | RateResponse
          | CryptoRateResponse;
        const nextRate =
          "brl" in data && typeof data.brl === "number"
            ? data.brl
            : "rate" in data && typeof data.rate === "number"
              ? data.rate
              : null;

        if (active && data.ok && Number.isFinite(nextRate)) {
          setRate(Number(nextRate));
          setUnavailable(false);
          return;
        }

        if (active) {
          setRate(null);
          setUnavailable(true);
        }
      } catch {
        if (active) {
          setRate(null);
          setUnavailable(true);
        }
      }
    }

    void loadRate();

    return () => {
      active = false;
    };
  }, [isUsdStableAsset, props.asset, shouldFetchRate]);

  const estimate = useMemo(() => {
    if (props.asset === "PIX" && props.amount > 0) {
      return props.amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (!rate || props.amount <= 0) return null;

    return (props.amount * rate).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [props.amount, props.asset, rate]);

  if (props.asset === "BRZ") return null;

  if (!estimate) {
    if (unavailable && shouldFetchRate) {
      return (
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          Estimativa em reais indisponível no momento.
        </span>
      );
    }

    return null;
  }

  if (props.asset === "PIX") {
    return (
      <span className="text-xs font-medium text-[var(--color-text-muted)]">
        Valor em reais: {estimate}
      </span>
    );
  }

  return (
    <span className="text-xs font-medium text-[var(--color-text-muted)]">
      {formatAmount(props.amount)} {props.asset} ≈ {estimate}
    </span>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
