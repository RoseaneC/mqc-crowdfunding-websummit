"use client";

import dynamic from "next/dynamic";

const LegacyAppPage = dynamic(() => import("./LegacyAppPage"), {
  ssr: false,
});

export default function LegacyAppNoSSR() {
  return <LegacyAppPage />;
}
