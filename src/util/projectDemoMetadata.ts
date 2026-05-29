export const projectThemeFilters = [
  "Todos",
  "Transição energética justa",
  "Equidade de gênero",
  "Segurança alimentar",
  "Inclusão produtiva",
  "Educação de qualidade",
] as const;

export type ProjectThemeFilter = (typeof projectThemeFilters)[number];
export type ProjectTheme = Exclude<ProjectThemeFilter, "Todos">;

export const allowedOdsNumbers = [2, 4, 5, 7, 8, 9, 10] as const;
export type OdsNumber = (typeof allowedOdsNumbers)[number];

export const odsNameByNumber: Record<OdsNumber, string> = {
  2: "ODS 2 - Fome zero e agricultura sustentável",
  4: "ODS 4 - Educação de qualidade",
  5: "ODS 5 - Igualdade de gênero",
  7: "ODS 7 - Energia limpa e acessível",
  8: "ODS 8 - Trabalho decente e crescimento econômico",
  9: "ODS 9 - Indústria, inovação e infraestrutura",
  10: "ODS 10 - Redução das desigualdades",
};

export type DemoCurrencyCode = "USDC" | "BRZ" | "XLM";

export const demoCurrencyLabels: Record<DemoCurrencyCode, string> = {
  USDC: "USDC",
  BRZ: "BRZ",
  XLM: "XLM Testnet",
};

export const defaultAcceptedDemoCurrencies: DemoCurrencyCode[] = [
  "USDC",
  "BRZ",
  "XLM",
];

export const webSummitDemoCurrencyNote =
  "Para a demonstração, as contribuições podem ser simuladas em USDC, BRZ e XLM Testnet. A liquidação real depende da integração final com carteira e contratos Stellar.";

export function formatDemoCurrencyLabel(currency: DemoCurrencyCode) {
  return demoCurrencyLabels[currency];
}
