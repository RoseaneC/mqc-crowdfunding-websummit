import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Memo,
  Networks,
  Operation,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const DEFAULT_MAINNET_HORIZON_URL = "https://horizon.stellar.org";
const PLACEHOLDER_DESTINATION =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const STROOPS_PER_UNIT = 10_000_000;
const MIN_PAYMENT_AMOUNT_XLM = 0.01;
const SAFETY_BALANCE_XLM = 0.1;
const BASE_RESERVE_XLM = 0.5;

type NativeBalanceLine = {
  asset_type: "native";
  balance: string;
};

export type StellarXlmMainnetConfig = {
  enabled: boolean;
  requested: boolean;
  destination: string | null;
  horizonUrl: string;
  networkPassphrase: string;
  missing: string[];
};

export type StellarXlmPreparedPayment = {
  transaction: Transaction;
  amount: string;
  destination: string;
  horizonUrl: string;
  networkPassphrase: string;
};

export type StellarXlmPaymentResult = {
  txHash: string;
  ledger: number;
  amount: string;
  destination: string;
};

export function isRealStellarXlmEnabled(): boolean {
  return getStellarXlmMainnetConfig().enabled;
}

export function getStellarXlmMainnetConfig(): StellarXlmMainnetConfig {
  const requested =
    process.env.NEXT_PUBLIC_ENABLE_STELLAR_XLM_MAINNET === "true";
  const destination =
    process.env.NEXT_PUBLIC_STELLAR_XLM_DESTINATION?.trim() || null;
  const stellarNetwork =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK?.trim() || null;
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL?.trim() ||
    DEFAULT_MAINNET_HORIZON_URL;
  const networkPassphrase =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE?.trim() ||
    Networks.PUBLIC;
  const missing = validateStellarXlmPaymentConfig({
    requested,
    destination,
    stellarNetwork,
  });

  return {
    enabled: requested && missing.length === 0,
    requested,
    destination,
    horizonUrl,
    networkPassphrase,
    missing,
  };
}

export function validateStellarXlmPaymentConfig(input?: {
  requested?: boolean;
  destination?: string | null;
  stellarNetwork?: string | null;
}): string[] {
  const requested =
    input?.requested ??
    process.env.NEXT_PUBLIC_ENABLE_STELLAR_XLM_MAINNET === "true";
  const destination =
    input?.destination ??
    process.env.NEXT_PUBLIC_STELLAR_XLM_DESTINATION?.trim() ??
    null;
  const stellarNetwork =
    input?.stellarNetwork ??
    process.env.NEXT_PUBLIC_STELLAR_NETWORK?.trim() ??
    null;
  const missing: string[] = [];

  if (!requested) {
    missing.push("NEXT_PUBLIC_ENABLE_STELLAR_XLM_MAINNET=true");
  }

  if (!destination) {
    missing.push("NEXT_PUBLIC_STELLAR_XLM_DESTINATION");
  } else if (!isValidStellarPublicKey(destination)) {
    missing.push(
      "NEXT_PUBLIC_STELLAR_XLM_DESTINATION com endereço G... válido",
    );
  } else if (isPlaceholderDestination(destination)) {
    missing.push("NEXT_PUBLIC_STELLAR_XLM_DESTINATION real, sem placeholder");
  }

  if (stellarNetwork !== "PUBLIC") {
    missing.push("NEXT_PUBLIC_STELLAR_NETWORK=PUBLIC");
  }

  return missing;
}

export function isPaymentWalletOnStellarMainnet(input: {
  network?: string;
  networkPassphrase?: string;
  expectedNetworkPassphrase?: string;
}): boolean {
  const expected = input.expectedNetworkPassphrase || Networks.PUBLIC;

  return (
    input.network === "PUBLIC" ||
    input.networkPassphrase === Networks.PUBLIC ||
    input.networkPassphrase === expected
  );
}

export async function buildXlmPaymentTransaction(input: {
  sourcePublicKey: string;
  amount: number;
  projectId: number;
  donorType: "PF" | "PJ";
}): Promise<StellarXlmPreparedPayment> {
  const config = getStellarXlmMainnetConfig();

  if (!config.enabled || !config.destination) {
    throw new Error(
      "Pagamento real em XLM na Stellar Mainnet ainda não está configurado.",
    );
  }

  if (!isValidStellarPublicKey(input.sourcePublicKey)) {
    throw new Error("Carteira de pagamento Stellar inválida.");
  }

  if (!isValidStellarPublicKey(config.destination)) {
    throw new Error("Destino Stellar inválido para pagamento em XLM.");
  }

  const amount = formatXlmAmount(input.amount);
  const server = createMainnetHorizonServer(config.horizonUrl);
  const account = await server.loadAccount(input.sourcePublicKey);
  const baseFee = await server
    .fetchBaseFee()
    .then(String)
    .catch(() => BASE_FEE);

  ensureSpendableXlmBalance({
    balances: account.balances,
    amount: Number(amount),
    subentryCount: Number(account.subentry_count ?? 0),
    numSponsoring: Number(account.num_sponsoring ?? 0),
    numSponsored: Number(account.num_sponsored ?? 0),
    feeStroops: Number(baseFee),
  });

  const transaction = new TransactionBuilder(account, {
    fee: baseFee,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: config.destination,
        asset: Asset.native(),
        amount,
      }),
    )
    .addMemo(Memo.text(`MQC-XLM-${input.projectId}-${input.donorType}`))
    .setTimeout(180)
    .build();

  return {
    transaction,
    amount,
    destination: config.destination,
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase,
  };
}

export async function submitSignedXlmTransaction(input: {
  preparedPayment: StellarXlmPreparedPayment;
  signerPublicKey: string;
  signedTxXdr: string;
}): Promise<StellarXlmPaymentResult> {
  const { preparedPayment } = input;

  if (!isValidStellarPublicKey(input.signerPublicKey)) {
    throw new Error("Carteira de pagamento Stellar inválida.");
  }

  const signedTransaction = TransactionBuilder.fromXDR(
    input.signedTxXdr,
    preparedPayment.networkPassphrase,
  );

  if (!signedTransaction.hash().equals(preparedPayment.transaction.hash())) {
    throw new Error(
      "A transação assinada não corresponde ao pagamento XLM preparado.",
    );
  }

  const server = createMainnetHorizonServer(preparedPayment.horizonUrl);
  const response = await server.submitTransaction(signedTransaction, {
    skipMemoRequiredCheck: true,
  });

  return {
    txHash: response.hash,
    ledger: response.ledger,
    amount: preparedPayment.amount,
    destination: preparedPayment.destination,
  };
}

function createMainnetHorizonServer(horizonUrl: string) {
  return new Horizon.Server(horizonUrl);
}

function formatXlmAmount(value: number) {
  if (!Number.isFinite(value) || value < MIN_PAYMENT_AMOUNT_XLM) {
    throw new Error("O valor mínimo para teste em XLM Mainnet é 0.01 XLM.");
  }

  const stroops = Math.round(value * STROOPS_PER_UNIT);

  return (stroops / STROOPS_PER_UNIT).toFixed(7);
}

function ensureSpendableXlmBalance(input: {
  balances: unknown[];
  amount: number;
  subentryCount: number;
  numSponsoring: number;
  numSponsored: number;
  feeStroops: number;
}) {
  const nativeBalance = input.balances.find(
    (balance): balance is NativeBalanceLine =>
      hasStringProperty(balance, "asset_type") &&
      hasStringProperty(balance, "balance") &&
      balance.asset_type === "native",
  );

  if (!nativeBalance) {
    throw new Error("Saldo XLM não encontrado na carteira de pagamento.");
  }

  const available = Number(nativeBalance.balance);
  const reserveEntries = Math.max(
    2,
    2 + input.subentryCount + input.numSponsoring - input.numSponsored,
  );
  const minimumReserve = reserveEntries * BASE_RESERVE_XLM;
  const fee = input.feeStroops / STROOPS_PER_UNIT;
  const requiredRemaining = minimumReserve + SAFETY_BALANCE_XLM + fee;

  if (!Number.isFinite(available) || available <= input.amount) {
    throw new Error("Saldo insuficiente de XLM na carteira de pagamento.");
  }

  if (available - input.amount < requiredRemaining) {
    throw new Error(
      `Não envie todo o saldo da carteira. Mantenha pelo menos ${requiredRemaining.toFixed(
        2,
      )} XLM para reserva e taxas da Stellar.`,
    );
  }
}

function isValidStellarPublicKey(value: string) {
  try {
    Keypair.fromPublicKey(value);
    return value.startsWith("G");
  } catch {
    return false;
  }
}

function isPlaceholderDestination(value: string) {
  return value === PLACEHOLDER_DESTINATION;
}

function hasStringProperty<T extends string>(
  value: unknown,
  key: T,
): value is Record<T, string> {
  const candidate = value as Record<string, unknown>;

  return (
    typeof value === "object" &&
    value !== null &&
    key in value &&
    typeof candidate[key] === "string"
  );
}
