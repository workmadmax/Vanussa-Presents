/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 22:11:12 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 20:51:51 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  user: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
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
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Detalhes do erro:", errorData);

        throw new Error(errorData.detail || "Usuário ou senha inválidos");
      }
      const data = await response.json();

      const accessToken = data.access;
      setToken(accessToken);
      setUser(username);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", username);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
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
