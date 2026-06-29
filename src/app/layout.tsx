import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Ponteia | Plataforma de Impacto",
  description:
    "Plataforma de apoio a projetos de impacto com Celo, USDGLO, PIX e prestação de contas.",
  icons: {
    icon: [{ url: "/ponteia-icon.svg", type: "image/svg+xml" }],
    shortcut: "/ponteia-icon.svg",
    apple: "/ponteia-icon.svg",
  },
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
