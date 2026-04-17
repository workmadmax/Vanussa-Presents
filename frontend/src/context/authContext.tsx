/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 22:11:12 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 22:07:24 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  user: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  async function loginUser(username: string, password: string) {
    const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "Login failed. Please try again.",
      };
    }
    const acessToken = data.access;

    setToken(acessToken);
    setUser(username);
    localStorage.setItem("token", acessToken);
    localStorage.setItem("user", username);
    return { success: true };
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
