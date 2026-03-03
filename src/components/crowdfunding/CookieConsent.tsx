import { useEffect, useState } from "react";

const STORAGE_KEY = "mqc_cookie_consent_v1";

type Consent = "accepted" | "rejected";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Consent | null;
      if (!saved) setOpen(true);
    } catch {
      // se localStorage falhar, mostra mesmo assim
      setOpen(true);
    }
  }, []);

  const save = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#1D1E27] text-white shadow-2xl">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl">
            <p className="font-semibold">Cookies e privacidade</p>
            <p className="text-sm text-white/80 mt-1">
              Usamos cookies para melhorar sua experiência e entender como o site é usado.
              Você pode aceitar ou ajustar suas preferências.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              onClick={() => save("rejected")}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 transition"
            >
              Recusar
            </button>

            <button
              onClick={() => save("accepted")}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-orange-500 hover:brightness-110 transition"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
