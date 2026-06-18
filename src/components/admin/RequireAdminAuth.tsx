import { useAuth } from "../../providers/AuthProvider";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">
        Carregando...
      </div>
    );
  }
  return <>{children}</>;
}
