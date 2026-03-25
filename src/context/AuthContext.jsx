import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../service/auth.service";
import { getProfile } from "../service/account.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await getProfile();
      return res.data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const userData = await fetchUser();
      setUser(userData); // nếu null cũng ok
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (accessToken, refreshToken, callback) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    setLoading(true);
    const userData = await fetchUser();
    setUser(userData);
    setLoading(false);

    if (userData && callback) callback(userData);
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
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
