"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user if token exists
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    })
      .then(res => {
        console.log("PROFILE RESPONSE:", res.data);
        setUser(res.data); // ✅ use res.data directly
      })
      .catch(err => {
        console.error("PROFILE ERROR:", err.response?.data || err.message);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    Cookies.set("token", res.data.token);
    console.log(res.data.user);
    
    setUser(res.data.user ?? null); // in case login returns { user, token }
    
    
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/api/auth/register", { username, email, password });
    return res.data;
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    // <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>

    // <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>

    //   {children}
    // </AuthContext.Provider>
    <AuthContext.Provider
      value={{
        user,
        setUser, // 🔹 keep this!
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
};

export const useAuth = () => useContext(AuthContext);
