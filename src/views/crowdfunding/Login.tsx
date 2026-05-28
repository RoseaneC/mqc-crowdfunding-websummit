import { connectWallet } from "../../util/wallet";
import { useWallet } from "../../hooks/useWallet";

export default function Login() {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-200 shadow-xl space-y-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Entrar com carteira
        </h1>
        <p className="text-slate-500">
          Use sua carteira Stellar para autenticar no painel de doações.
        </p>
        <button
          onClick={() => void connectWallet()}
          className="w-full bg-[#002B99] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs"
        >
          {address ? "Carteira conectada" : "Conectar carteira"}
        </button>
      </div>
    </div>
  );
}
