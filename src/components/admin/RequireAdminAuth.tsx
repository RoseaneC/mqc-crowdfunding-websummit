import { Navigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">
        Carregando...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/auth" replace />;
  }
  return <>{children}</>;
}
