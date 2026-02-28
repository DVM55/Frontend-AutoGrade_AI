import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logOut } from "../service/auth.service";

const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.log("Logout API error:", err?.response?.data);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);

      // replace để không back lại được
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("===== INIT AUTH START =====");

      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      console.log("Token in storage:", token);
      console.log("RefreshToken in storage:", refreshToken);

      if (!token) {
        console.log("❌ Không có access token");
        setLoading(false);
        return;
      }

      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (!decoded) {
        console.log("❌ Decode thất bại → logout");
        logout();
        setLoading(false);
        return;
      }

      console.log("exp:", decoded.exp);
      console.log("now:", Date.now());

      const now = Date.now();
      const exp = decoded.exp * 1000; // convert seconds -> milliseconds

      const isExpired = exp < now;

      console.log("Is expired:", isExpired);

      if (!isExpired) {
        console.log("✅ Token còn hạn → setUser");
        setUser({
          token,
          role: decoded.role,
        });
      } else if (refreshToken) {
        console.log("⚠ Token hết hạn → thử refresh");

        try {
          const res = await axios.post(
            "http://localhost:8080/api/v1/auth/refresh-accessToken",
            { refreshToken },
          );

          console.log("✅ Refresh thành công:", res.data);

          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;

          localStorage.setItem("access_token", newAccessToken);
          localStorage.setItem("refresh_token", newRefreshToken);

          const newDecoded = decodeToken(newAccessToken);

          setUser({
            token: newAccessToken,
            role: newDecoded.role,
          });
        } catch (err) {
          console.log(
            "❌ Refresh thất bại:",
            err.response?.data || err.message,
          );
          logout();
        }
      } else {
        console.log("❌ Token hết hạn và không có refresh → logout");
        logout();
      }

      console.log("===== INIT AUTH END =====");
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    const decoded = decodeToken(accessToken);

    setUser({
      token: accessToken,
      role: decoded.role,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
