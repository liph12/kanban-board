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
  setUserAuth: (user: AuthUser) => void;
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

  const setUserAuth = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, setUserAuth, logout }}>
      {children}
    </AuthContext.Provider>
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
