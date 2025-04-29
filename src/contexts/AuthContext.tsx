import axios, { AxiosError } from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  isAuthenticated: boolean;
  email?: string;
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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const accessToken = localStorage.getItem("accessToken");
    const userEmail = localStorage.getItem("userEmail");

    if (accessToken) {
      // Set default axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setUser({
        isAuthenticated: true,
        email: userEmail || undefined,
      });
    }

    setLoading(false);
  }, []);

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const email = localStorage.getItem("userEmail");

      if (!refreshToken || !email) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post("http://localhost:8080/auth/refresh", {
        email,
        refreshToken,
      });

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
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If error is 401 and not a retry and we have a refresh token
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          localStorage.getItem("refreshToken")
        ) {
          originalRequest._retry = true;

          const refreshed = await refreshToken();
          if (refreshed && originalRequest) {
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
      // Call logout endpoint if needed
      axios.post("http://localhost:8080/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");

      // Clear axios header
      delete axios.defaults.headers.common["Authorization"];

      // Update state
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

// Add this declaration for axios config
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
