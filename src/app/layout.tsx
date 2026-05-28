import type { Metadata } from "next";
import "../index.css";
import "@stellar/design-system/build/styles.min.css";

export const metadata: Metadata = {
  title: "Mulheres Que Codam | Plataforma de Impacto",
  description:
    "Plataforma de financiamento coletivo para projetos liderados por mulheres.",
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
