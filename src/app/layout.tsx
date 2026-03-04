import type { Metadata } from "next";
import "../index.css";
import "@stellar/design-system/build/styles.min.css";

export const metadata: Metadata = {
  title: "MQC Platform",
  description: "MQC crowdfunding and admin platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
