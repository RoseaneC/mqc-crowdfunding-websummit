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
import { Buffer } from "buffer";

export const MQC_STELLAR_USDC_RECEIVER =
  "GCDNOMMK4B4XKLUEHHI4BEEGZNMXHVVPFUBFRQ2ZXW4YAUDWDKVWPQFM";

const DEFAULT_MAINNET_HORIZON_URL = "https://horizon.stellar.org";
const STELLAR_USDC_ASSET_CODE = "USDC";
const STROOPS_PER_UNIT = 10_000_000;

type HexHash = `0x${string}`;

type StellarUsdcMainnetConfig = {
  enabled: boolean;
  receiver: string;
  usdcIssuer: string | null;
  horizonUrl: string;
  networkPassphrase: string;
  missing: string[];
};

type AssetBalanceLine = {
  asset_code: string;
  asset_issuer: string;
  balance: string;
};

export type StellarUsdcPreparedPayment = {
  transaction: Transaction;
  hashHex: HexHash;
  amount: string;
  receiver: string;
  usdcIssuer: string;
  horizonUrl: string;
};

export type StellarUsdcPaymentResult = {
  txHash: string;
  ledger: number;
  amount: string;
  receiver: string;
};

export function getStellarUsdcMainnetConfig(): StellarUsdcMainnetConfig {
  const enableMainnet =
    process.env.NEXT_PUBLIC_ENABLE_STELLAR_USDC_MAINNET === "true";
  const usdcIssuer =
    process.env.NEXT_PUBLIC_STELLAR_USDC_ISSUER?.trim() || null;
  const receiver =
    process.env.NEXT_PUBLIC_STELLAR_USDC_RECEIVER?.trim() ||
    MQC_STELLAR_USDC_RECEIVER;
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_MAINNET_HORIZON_URL?.trim() ||
    DEFAULT_MAINNET_HORIZON_URL;
  const networkPassphrase =
    process.env.NEXT_PUBLIC_STELLAR_MAINNET_NETWORK_PASSPHRASE?.trim() ||
    Networks.PUBLIC;

  const missing: string[] = [];

  if (!enableMainnet) {
    missing.push("NEXT_PUBLIC_ENABLE_STELLAR_USDC_MAINNET=true");
  }

  if (!usdcIssuer) {
    missing.push("NEXT_PUBLIC_STELLAR_USDC_ISSUER");
  }

  if (!isValidStellarPublicKey(receiver)) {
    missing.push("NEXT_PUBLIC_STELLAR_USDC_RECEIVER");
  }

  return {
    enabled: enableMainnet && missing.length === 0,
    receiver,
    usdcIssuer,
    horizonUrl,
    networkPassphrase,
    missing,
  };
}

export async function prepareStellarUsdcMainnetPayment(input: {
  sourcePublicKey: string;
  amount: number;
  projectId: number;
  donorType: "PF" | "PJ";
}): Promise<StellarUsdcPreparedPayment> {
  const config = getStellarUsdcMainnetConfig();

  if (!config.enabled || !config.usdcIssuer) {
    throw new Error(
      "Pagamento real em USDC na Stellar Mainnet ainda não está configurado.",
    );
  }

  if (!isValidStellarPublicKey(input.sourcePublicKey)) {
    throw new Error("Carteira Stellar do Privy inválida.");
  }

  if (!isValidStellarPublicKey(config.receiver)) {
    throw new Error("Carteira recebedora Stellar inválida.");
  }

  const amount = formatStellarAmount(input.amount);
  const server = createMainnetHorizonServer(config.horizonUrl);
  const account = await server.loadAccount(input.sourcePublicKey);

  ensureUsdcBalance(account.balances, config.usdcIssuer, Number(amount));

  const baseFee = await server
    .fetchBaseFee()
    .then(String)
    .catch(() => BASE_FEE);
  const usdc = new Asset(STELLAR_USDC_ASSET_CODE, config.usdcIssuer);
  const transaction = new TransactionBuilder(account, {
    fee: baseFee,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: config.receiver,
        asset: usdc,
        amount,
      }),
    )
    .addMemo(Memo.text(`MQC-${input.projectId}-${input.donorType}`))
    .setTimeout(180)
    .build();

  return {
    transaction,
    hashHex: bufferToHex(transaction.hash()),
    amount,
    receiver: config.receiver,
    usdcIssuer: config.usdcIssuer,
    horizonUrl: config.horizonUrl,
  };
}

export async function submitStellarUsdcMainnetPayment(input: {
  preparedPayment: StellarUsdcPreparedPayment;
  signerPublicKey: string;
  rawSignature: HexHash;
}): Promise<StellarUsdcPaymentResult> {
  const { preparedPayment } = input;
  const signatureBytes = hexToBuffer(input.rawSignature);
  const keypair = Keypair.fromPublicKey(input.signerPublicKey);

  if (!keypair.verify(preparedPayment.transaction.hash(), signatureBytes)) {
    throw new Error(
      "A assinatura raw_sign do Privy não confere com a transação.",
    );
  }

  preparedPayment.transaction.addSignature(
    input.signerPublicKey,
    signatureBytes.toString("base64"),
  );

  const server = createMainnetHorizonServer(preparedPayment.horizonUrl);
  const response = await server.submitTransaction(preparedPayment.transaction, {
    skipMemoRequiredCheck: true,
  });

  return {
    txHash: response.hash,
    ledger: response.ledger,
    amount: preparedPayment.amount,
    receiver: preparedPayment.receiver,
  };
}

export function toHexHash(value: string): HexHash {
  if (!/^0x[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) {
    throw new Error("Hash Stellar inválido para assinatura raw_sign.");
  }

  return value as HexHash;
}

function createMainnetHorizonServer(horizonUrl: string) {
  return new Horizon.Server(horizonUrl);
}

function formatStellarAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Informe um valor de contribuição válido.");
  }

  const stroops = Math.round(value * STROOPS_PER_UNIT);

  if (stroops <= 0) {
    throw new Error("O valor mínimo em USDC é 0.0000001.");
  }

  return (stroops / STROOPS_PER_UNIT).toFixed(7);
}

function ensureUsdcBalance(
  balances: unknown[],
  usdcIssuer: string,
  amount: number,
) {
  const usdcBalance = balances.find(
    (balance): balance is AssetBalanceLine =>
      hasStringProperty(balance, "asset_code") &&
      hasStringProperty(balance, "asset_issuer") &&
      hasStringProperty(balance, "balance") &&
      balance.asset_code === STELLAR_USDC_ASSET_CODE &&
      balance.asset_issuer === usdcIssuer,
  );

  if (!usdcBalance) {
    throw new Error(
      "A carteira Stellar do Privy precisa ter trustline e saldo em USDC Mainnet.",
    );
  }

  const available = Number(usdcBalance.balance);

  if (!Number.isFinite(available) || available < amount) {
    throw new Error("Saldo insuficiente de USDC na carteira Stellar do Privy.");
  }
}

function isValidStellarPublicKey(value: string) {
  try {
    Keypair.fromPublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function hasStringProperty(
  value: unknown,
  key: keyof AssetBalanceLine,
): value is AssetBalanceLine {
  const candidate = value as Record<string, unknown>;

  return (
    typeof value === "object" &&
    value !== null &&
    key in value &&
    typeof candidate[key] === "string"
  );
}

function bufferToHex(buffer: Buffer): HexHash {
  return `0x${buffer.toString("hex")}`;
}

function hexToBuffer(value: HexHash): Buffer {
  return Buffer.from(value.slice(2), "hex");
}
