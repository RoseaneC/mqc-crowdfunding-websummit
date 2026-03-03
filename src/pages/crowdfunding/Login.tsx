import { connectWallet } from "../../util/wallet";
import { useWallet } from "../../hooks/useWallet";

export default function Login() {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Entrar com Carteira
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Use sua carteira Stellar para autenticar no painel de doações.
        </p>
        <button
          onClick={() => void connectWallet()}
          className="w-full bg-[#002B99] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs"
        >
          {address ? "Carteira Conectada" : "Conectar Carteira"}
        </button>
      </div>
    </div>
  );
}
