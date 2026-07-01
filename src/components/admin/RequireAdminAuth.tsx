import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { getAdminMe } from "../../util/crowdfundingApi";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setIsAdmin(false);
      setPermissionChecked(false);
      setIsCheckingPermission(false);
      return;
    }

    setIsCheckingPermission(true);
    setPermissionChecked(false);

    void getAdminMe()
      .then((response) => {
        if (!cancelled) {
          setIsAdmin(response.isAdmin);
          setPermissionChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setPermissionChecked(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCheckingPermission(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || isCheckingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <AdminAccessMessage
        title="Conecte-se para acessar a área administrativa."
        actionLabel="Entrar no Admin"
        actionHref="/admin/auth"
      />
    );
  }

  if (permissionChecked && !isAdmin) {
    return (
      <AdminAccessMessage title="Você não tem permissão para acessar esta área." />
    );
  }

  return <>{children}</>;
}

function AdminAccessMessage(props: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-6 text-[var(--color-text)]">
      <div className="max-w-md rounded-sm border border-[var(--color-border)] bg-[var(--color-white)] p-8 text-center shadow-[0_18px_44px_rgba(28,26,23,0.08)]">
        <h1 className="font-[var(--font-heading)] text-xl font-black">
          {props.title}
        </h1>
        {props.actionHref && props.actionLabel ? (
          <Link
            to={props.actionHref}
            className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            {props.actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
