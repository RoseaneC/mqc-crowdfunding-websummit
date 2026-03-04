import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAuthMe,
  loginUser,
  logoutUser,
  registerUser,
  type AuthMeDTO,
} from "../util/crowdfundingApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "../util/api";

type AuthContextType = {
  user: AuthMeDTO | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    walletAddress?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (role: "SUPERADMIN" | "PROJECT_ADMIN") => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthMeDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    if (!getAuthToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getAuthMe();
      setUser(me);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const session = await loginUser({ email, password });
    setAuthToken(session.token);
    await refresh();
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    walletAddress?: string,
  ) => {
    const session = await registerUser({ name, email, password, walletAddress });
    setAuthToken(session.token);
    await refresh();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // noop
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refresh,
      hasRole: (role) => Boolean(user?.roles.includes(role)),
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
