type SignAndSendInput = {
  signTransaction?: unknown;
};

type GuessResult = {
  isErr: () => boolean;
  unwrapErr: () => unknown;
  unwrap: () => boolean;
};

async function guess(..._args: unknown[]) {
  return {
    signAndSend: async (_input: SignAndSendInput) => ({
      result: {
        isErr: () => false,
        unwrapErr: () => null,
        unwrap: () => false,
      } satisfies GuessResult,
    }),
  };
}

export const networks = {};
export const contract = {};

export class Client {
  constructor(..._args: unknown[]) {}

  guess = guess;
}

const fallbackClient = {
  guess,
};

export default fallbackClient;
