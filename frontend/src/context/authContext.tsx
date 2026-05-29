/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 22:11:12 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/26 11:49:08 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";

type AuthResponse = {
	access: string;
	refresh?: string;
};

type AuthErrorData = {
	username?: string[];
	email?: string[];
	password?: string[];
	detail?: string;
};

type ApiError = {
	response?: {
		data?: AuthErrorData;
	};
};

type AuthContextType = {
	user: string | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	registerUser: (
		username: string,
		email: string,
		password: string
	) => Promise<{ success: boolean; message?: string }>;
	loginUser: (
		username: string,
		password: string
	) => Promise<{ success: boolean; message?: string }>;
	logout: () => void;
};

type StoredAuth = {
	user: string | null;
	token: string | null;
};

type AuthState = StoredAuth & {
	isLoading: boolean;
};

function readStoredAuth(): StoredAuth {
	if (typeof window === "undefined") {
		return { user: null, token: null };
	}

	const token = window.localStorage.getItem("token");
	const user = window.localStorage.getItem("user");

	if (!token || !user) {
		return { user: null, token: null };
	}

	return { user, token };
}

async function registerUser(
	username: string,
	email: string,
	password: string
): Promise<{ success: boolean; message?: string }> {
	try {
		await api.post("/users/register/", { username, email, password });
		return { success: true };
	} catch (error) {
		const data = (error as ApiError).response?.data ?? {};
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<AuthState>({
		user: null,
		token: null,
		isLoading: true,
	});
	const { user, token, isLoading } = auth;

	useEffect(() => {
		let isMounted = true;

		queueMicrotask(() => {
			if (isMounted) {
				setAuth({ ...readStoredAuth(), isLoading: false });
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	async function loginUser(username: string, password: string) {
		try {
			const response = await api.post<AuthResponse>("/users/login/", {
				username,
				password,
			});
			const accessToken = response.data.access;
			const refreshToken = response.data.refresh;

			setAuth({ user: username, token: accessToken, isLoading: false });

			localStorage.setItem("token", accessToken);
			localStorage.setItem("user", username);
			if (refreshToken) {
				localStorage.setItem("refresh_token", refreshToken);
			}

			return { success: true };
		} catch (error) {
			const data = (error as ApiError).response?.data ?? {};
			return {
				success: false,
				message: data.detail || "Login failed. Please try again.",
			};
		}
	}

	function logout() {
		setAuth({ user: null, token: null, isLoading: false });
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		localStorage.removeItem("refresh_token");
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!token,
				isLoading,
				registerUser,
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
