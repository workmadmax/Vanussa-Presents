/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 22:11:12 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/17 21:41:00 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  user: string | null;
  token: string | null;
  isAuthenticated: boolean;
  registerUser: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  loginUser: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch {}
  if (!response.ok) {
    return {
      success: false,
      message:
        data.username?.[0] ||
        data.email?.[0] ||
        data.password?.[0] ||
        data.detail ||
        "Registration failed. Please try again.",
    };
  }
  return { success: true };
}

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
      value={{
        user,
        token,
        isAuthenticated: !!token,
        registerUser: registerUser,
        loginUser,
        logout,
      }}
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
