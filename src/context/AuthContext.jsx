import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../service/auth.service";
import { getProfile } from "../service/account.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await getProfile();
        if (isMounted) setUser(res.data);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []); // chỉ chạy 1 lần khi mount

  const login = async (accessToken, refreshToken, callback) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    setLoading(true);
    try {
      const res = await getProfile();
      setUser(res.data);
      if (callback) callback(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.log(err);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/trang-chu", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
