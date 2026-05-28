type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>;

function createNoopContractClient() {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined;

        const fn: AnyAsyncFunction = async (..._args: unknown[]) => {
          console.warn(
            "[dev fallback] Stellar contract client has not been generated. Method called:",
            String(prop),
          );

          return {
            success: true,
            hash: "dev-fallback-transaction",
            result: null,
          };
        };

        return fn;
      },
    },
  );
}

export const networks = {};
export const contract = {};

export class Client {
  constructor(..._args: unknown[]) {
    return createNoopContractClient();
  }
}

export function createCrowdfundingClient(..._args: unknown[]) {
  return createNoopContractClient();
}

export default Client;
