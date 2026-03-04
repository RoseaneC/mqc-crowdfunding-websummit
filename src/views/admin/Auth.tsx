import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, walletAddress || undefined);
      }
      void navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de autenticacao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${
              mode === "login" ? "bg-[#002B99] text-white" : "text-slate-500"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${
              mode === "register" ? "bg-[#002B99] text-white" : "text-slate-500"
            }`}
          >
            Registrar
          </button>
        </div>

        {mode === "register" ? (
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3"
          />
        </label>
        {mode === "register" ? (
          <label className="block">
            <span className="text-xs font-bold text-slate-500">
              Wallet Stellar (opcional)
            </span>
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3"
            />
          </label>
        ) : null}

        {error ? (
          <p className="text-xs font-bold text-red-600 break-all">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading}
          className="w-full bg-[#002B99] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-60"
        >
          {loading
            ? "Processando..."
            : mode === "login"
              ? "Entrar no Admin"
              : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}
