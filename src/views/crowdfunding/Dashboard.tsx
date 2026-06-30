import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePrivyWalletAbstraction } from "../../hooks/usePrivyWalletAbstraction";
import { useDonations } from "../../providers/DonationProvider";
import {
  listProjectNftCatalog,
  listProjectMedia,
  type ProjectNftCatalogItemDTO,
  type ProjectMediaItemDTO,
} from "../../util/crowdfundingApi";
import { resolveNftColor, resolveNftGradient } from "../../util/nftVisuals";
import {
  buildNftTokenExplorerUrl,
  buildTransactionExplorerUrl,
  getExplorerLabel,
} from "../../util/explorerLinks";

export default function Dashboard() {
  const { donations } = useDonations();
  const privyWallet = usePrivyWalletAbstraction();
  const [catalog, setCatalog] = useState<ProjectNftCatalogItemDTO[]>([]);
  const [projectMedia, setProjectMedia] = useState<ProjectMediaItemDTO[]>([]);
  const [selectedNft, setSelectedNft] =
    useState<ProjectNftCatalogItemDTO | null>(null);

  useEffect(() => {
    void Promise.all([listProjectNftCatalog(), listProjectMedia()])
      .then(([catalogResponse, mediaResponse]) => {
        setCatalog(catalogResponse);
        setProjectMedia(mediaResponse);
      })
      .catch(() => {});
  }, []);

  const mediaById = useMemo(() => {
    return new Map(projectMedia.map((item) => [item.id, item]));
  }, [projectMedia]);
  const explorerLabel = getExplorerLabel();
  const successfulDonations = useMemo(
    () => donations.filter((donation) => donation.status === "CONFIRMED"),
    [donations],
  );
  const ownedProjectIds = useMemo(
    () =>
      new Set(
        successfulDonations
          .map((donation) => Number(donation.projectId))
          .filter((projectId) => Number.isFinite(projectId)),
      ),
    [successfulDonations],
  );
  const nftTokenByProjectId = useMemo(() => {
    const map = new Map<number, number>();
    for (const donation of successfulDonations) {
      const projectId = Number(donation.projectId);
      const nftId = Number(donation.nftId);
      if (!Number.isFinite(projectId) || !Number.isFinite(nftId) || nftId <= 0)
        continue;
      if (!map.has(projectId)) map.set(projectId, nftId);
    }
    return map;
  }, [successfulDonations]);
  const ownedNftCount = useMemo(
    () =>
      catalog.filter((item) => ownedProjectIds.has(Number(item.projectId)))
        .length,
    [catalog, ownedProjectIds],
  );
  const selectedNftExplorerUrl = selectedNft
    ? buildNftTokenExplorerUrl(
        nftTokenByProjectId.get(Number(selectedNft.projectId)),
      )
    : null;
  const isLoggedIn = privyWallet.authenticated;
  const hasConnectedWallet = Boolean(privyWallet.evmAddress);

  const handleConnectWallet = () => {
    void Promise.resolve()
      .then(() => privyWallet.login())
      .catch(() => undefined);
  };

  if (!isLoggedIn || !hasConnectedWallet) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl items-center px-4 py-16">
          <section className="w-full rounded-[2.5rem] border border-slate-100 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-orange-500">
              Painel do apoiador
            </p>
            <h1 className="mt-5 text-4xl font-black uppercase tracking-tighter text-slate-900">
              Conecte sua carteira para acessar seu painel.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-500">
              Depois de entrar, a Ponteia busca seu histórico pela carteira EVM
              conectada. Quando apoiar um projeto, seus comprovantes aparecerão
              aqui.
            </p>
            <button
              type="button"
              onClick={handleConnectWallet}
              disabled={!privyWallet.ready}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Entrar / Conectar carteira
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] italic">
              Painel de
              <br /> <span className="text-orange-500 not-italic">Impacto</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">
              Sincronização on-chain • Protocolo 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic border-b-4 border-slate-100 pb-4">
              Projetos Apoiados
            </h2>
            {successfulDonations.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4">
                <span className="material-icons text-6xl text-slate-300">
                  favorite_border
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-400">
                  Você ainda não tem apoios registrados.
                </h3>
                <p className="mx-auto max-w-lg text-sm font-semibold leading-7 text-slate-500">
                  Quando apoiar um projeto, seus comprovantes aparecerão aqui.
                </p>
                <Link
                  to="/projetos"
                  className="inline-block bg-orange-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.3em]"
                >
                  Conhecer projetos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {successfulDonations.map((donation) => {
                  const media = mediaById.get(String(donation.projectId));
                  const donationDate = new Date(
                    donation.timestamp,
                  ).toLocaleDateString("pt-BR");
                  const txExplorerUrl = buildTransactionExplorerUrl(
                    donation.txHash,
                  );
                  const nftExplorerUrl = buildNftTokenExplorerUrl(
                    Number(donation.nftId),
                  );
                  return (
                    <div
                      key={donation.id}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-8"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl">
                        <img
                          src={
                            media?.img ?? "/images/projetos/mqc-ideathon.jpeg"
                          }
                          className="w-full h-full object-cover"
                          alt={donation.projectName}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center gap-3">
                          <h3 className="text-xl font-black uppercase tracking-tight italic">
                            {donation.projectName}
                          </h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {donationDate}
                          </span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                          {formatDonationAmount(donation.amount)}{" "}
                          {donation.asset ?? "BRZ"}
                        </p>
                        {txExplorerUrl || nftExplorerUrl ? (
                          <div className="pt-1 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.18em]">
                            {txExplorerUrl ? (
                              <a
                                href={txExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#002B99] hover:underline inline-flex items-center gap-1"
                                title={`Abrir transação no ${explorerLabel}`}
                              >
                                TX
                                <span className="material-icons text-xs">
                                  open_in_new
                                </span>
                              </a>
                            ) : null}
                            {nftExplorerUrl ? (
                              <a
                                href={nftExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:underline inline-flex items-center gap-1"
                                title={`Abrir NFT no ${explorerLabel}`}
                              >
                                NFT
                                <span className="material-icons text-xs">
                                  open_in_new
                                </span>
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                  Comprovantes de Impacto
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                  Inventário
                </p>
                <p className="text-xs font-black text-orange-400 uppercase tracking-wider">
                  Registros recebidos: {ownedNftCount}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Liberados ao confirmar sua doação digital
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {catalog.map((nft) => {
                  const owned = ownedProjectIds.has(Number(nft.projectId));
                  const nftColor = resolveNftColor(nft.color);
                  return (
                    <button
                      key={nft.projectId}
                      type="button"
                      onClick={() => {
                        if (owned) setSelectedNft(nft);
                      }}
                      className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 p-1 transition-all ${
                        owned
                          ? "border-orange-500 bg-slate-800 shadow-[0_0_20px_rgba(249,115,22,0.25)]"
                          : "border-slate-800 bg-slate-950 opacity-30 grayscale cursor-default"
                      }`}
                    >
                      <div
                        className={`${nftColor} w-full h-full rounded-lg flex items-center justify-center text-white`}
                      >
                        <span className="material-icons text-xl">
                          {nft.icon}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
              {ownedNftCount === 0 ? (
                <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">
                  Você ainda não possui comprovantes de impacto.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {selectedNft ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setSelectedNft(null)}
        >
          <div
            className={`w-full max-w-3xl rounded-[2.3rem] p-[3px] bg-slate-900 bg-gradient-to-br ${resolveNftGradient(selectedNft.gradient)} shadow-[0_0_70px_rgba(0,0,0,0.7)]`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full rounded-[2.15rem] bg-slate-900/65 backdrop-blur-xl text-white p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-300">
                    Comprovante de impacto
                  </p>
                  <h3 className="text-4xl font-black uppercase tracking-tight">
                    {selectedNft.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedNft.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                      Projeto
                    </p>
                    <p className="text-xl font-black uppercase">
                      {selectedNft.projectTitle}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center">
                    <span className="material-icons text-5xl">
                      {selectedNft.icon}
                    </span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Raridade: {selectedNft.rarity}
                  </p>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Badge: {selectedNft.thanks}
                  </p>
                  {selectedNftExplorerUrl ? (
                    <a
                      href={selectedNftExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300 hover:underline inline-flex items-center gap-1"
                      title={`Abrir NFT no ${explorerLabel}`}
                    >
                      Ver registro no {explorerLabel}
                      <span className="material-icons text-xs">
                        open_in_new
                      </span>
                    </a>
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Registro indisponível no explorer
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatDonationAmount(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}
