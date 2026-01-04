"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
      console.log("from---> auth",user);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/user/profile/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data?.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // 
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });


    const data = await res.json();
    if (res.ok) {
      setUser(data?.data?.user);
    } else {
      throw new Error(data?.data?.message || "Login failed");
    }

    setIsLoading(false);
  };

  const register = async (
    email: string,
    password: string,
    userName: string,
    image:string
  ) => {
    setIsLoading(true);
    const res = await fetch(`${BASE_URL}/api/v1/user/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userName , image}),
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
    } else {
      throw new Error(data.message || "Registration failed");
    }

    setIsLoading(false);
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");

  return context;
}
