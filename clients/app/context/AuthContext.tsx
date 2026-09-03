"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((res) => {    
        console.log("PROFILE RESPONSE:", res.data.data);
        setUser(res.data.data);
      })
      .catch((err) => {
        console.error(
          "PROFILE ERROR:",
          err.response?.data || err.message
        );
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    Cookies.set("token", res.data.token);

    setUser(res.data.user ?? null);
    console.log("LOGIN RESPONSE:", res.data.user);

    return res.data;
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post("/api/auth/register", {
      username,
      email,
      password,
      firstName,
      lastName,
    });

    return res.data;
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  const resendVerification = async (email: string) => {
    const res = await api.post("/api/auth/resend-verification", {
      email,
    });

    return res.data?.message;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        resendVerification,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};