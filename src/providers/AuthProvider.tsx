import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import useAxios from "../hooks/useAxios";
import { getUserJson } from "../helpers";
import PageLoader from "../components/PageLoader";
import { GoogleOAuthProvider } from "@react-oauth/google";

export type AuthUser = {
  id: number;
  name: string;
  full_name: string;
  cover_photo: string;
  email: string;
  avatar: string;
  mobile_number: string;
  auth_token: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  setUserAuth: (user: AuthUser, auth?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const axios = useAxios();
  const storedUser = getUserJson();
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authenticateAsync = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/authenticate`, {
          headers: {
            Authorization: `Bearer ${storedUser.auth_token}`,
          },
        });

        const { data } = response.data;

        setUser(data);
      } catch (e) {
        // to do
      } finally {
        setLoading(false);
      }
    };

    authenticateAsync();
  }, []);

  const setUserAuth = (userData: AuthUser, auth: boolean = true) => {
    setUser(userData);
    setLoading(auth);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem("auth_user");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <GoogleOAuthProvider clientId="478246977904-cdcr130jpmsddrr54b0jmiknkk80nqof.apps.googleusercontent.com">
      <AuthContext.Provider value={{ user, setUserAuth, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
