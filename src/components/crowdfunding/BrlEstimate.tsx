"use client";

import { useEffect, useMemo, useState } from "react";

type RateResponse = {
  ok: boolean;
  rate?: number;
};

export function BrlEstimate(props: {
  amount: number;
  asset: "USDGLO" | "USDC";
}) {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRate() {
      try {
        const response = await fetch("/api/rates/usd-brl", {
          cache: "no-store",
        });
        const data = (await response.json()) as RateResponse;

        if (active && data.ok && Number.isFinite(data.rate)) {
          setRate(Number(data.rate));
        }
      } catch {
        if (active) {
          setRate(null);
        }
      }
    }

    void loadRate();

    return () => {
      active = false;
    };
  }, []);

  const estimate = useMemo(() => {
    if (!rate || props.amount <= 0) return null;

    return (props.amount * rate).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [props.amount, rate]);

  if (!estimate) return null;

  return (
    <span className="text-xs font-medium text-[var(--color-text-muted)]">
      {formatAmount(props.amount)} {props.asset} (Aprox. {estimate})
    </span>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
