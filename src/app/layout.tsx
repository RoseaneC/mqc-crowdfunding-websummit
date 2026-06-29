import type { Metadata } from "next";
import "../index.css";
import "@stellar/design-system/build/styles.min.css";

export const metadata: Metadata = {
  title: "Ponteia | Plataforma de Impacto",
  description:
    "Plataforma de apoio a projetos de impacto com Celo, USDGLO, PIX e prestação de contas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
