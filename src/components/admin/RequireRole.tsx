import { Navigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function RequireRole({
  role,
  children,
}: {
  role: "SUPERADMIN" | "PROJECT_ADMIN";
  children: React.ReactNode;
}) {
  const { isLoading, hasRole } = useAuth();
  if (isLoading) return null;
  if (!hasRole(role)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
