import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sprawdzanie stanu autentykacji przy pierwszym renderowaniu
  useEffect(() => {
    const checkAuthState = () => {
      console.log("Checking auth state...");
      const accessToken = localStorage.getItem("accessToken");
      console.log(
        "Access token from localStorage:",
        accessToken ? "Found" : "Not found"
      );

      if (accessToken) {
        // Ustawienie nagłówka Axios
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        console.log("Setting user as authenticated");
        setUser({ isAuthenticated: true });
      } else {
        console.log("No access token found, user not authenticated");
        setUser(null);
      }

      setLoading(false);
    };

    checkAuthState();
  }, []);

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const email = localStorage.getItem("userEmail");

      if (!refreshToken || !email) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<RefreshTokenResponse>(
        "http://localhost:8080/auth/refresh",
        {
          email,
          refreshToken,
        }
      );

      if (response.data && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Extract original request
        const originalRequest = error.config;

        // If error is 401 and not a retry and we have a refresh token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem("refreshToken")
        ) {
          originalRequest._retry = true;

          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const logout = () => {
    try {
      axios.post("http://localhost:8080/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");

      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  console.log("AuthContext value:", { user, loading, isAuthenticated: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  console.log("useAuth hook called, context:", context);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
