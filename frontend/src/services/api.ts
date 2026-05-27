/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 17:28:10 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/26 11:18:32 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios, {
	AxiosError,
	AxiosHeaders,
	InternalAxiosRequestConfig,
} from "axios";

type RetryRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";

function getAuthStorage() {
	if (typeof window === "undefined") {
		return null;
	}
	return window.localStorage;
}

function clearAuthStorage() {
	const storage = getAuthStorage();

	if (!storage) {
		return;
	}

	storage.removeItem("token");
	storage.removeItem("user");
	storage.removeItem("refresh_token");
}

function redirectToHome() {
	if (typeof window !== "undefined") {
		window.location.href = "/";
	}
}

export async function refreshAccessToken(refresh: string) {
	const res = await axios.post(`${API_BASE_URL}users/token/refresh/`, {
		refresh,
	});
	return res.data.access as string;
}

export const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = getAuthStorage()?.getItem("token");
	if (token) {
		config.headers = AxiosHeaders.from(config.headers);
		config.headers.set("Authorization", `Bearer ${token}`);
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as RetryRequestConfig | undefined;

		if (error.response?.status === 401 && original && !original._retry) {
			original._retry = true;

			const refresh = getAuthStorage()?.getItem("refresh_token");
			if (!refresh) {
				clearAuthStorage();
				redirectToHome();
				return Promise.reject(error);
			}

			try {
				const newToken = await refreshAccessToken(refresh);
				getAuthStorage()?.setItem("token", newToken);
				original.headers = AxiosHeaders.from(original.headers);
				original.headers.set("Authorization", `Bearer ${newToken}`);
				return api(original);
			} catch {
				clearAuthStorage();
				redirectToHome();
				return Promise.reject(error);
			}
		}

		return Promise.reject(error);
	}
);
