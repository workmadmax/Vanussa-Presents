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

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type RetryRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";

function clearAuthStorage() {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	localStorage.removeItem("refresh_token");
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
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as RetryRequestConfig | undefined;

		if (error.response?.status === 401 && original && !original._retry) {
			original._retry = true;

			const refresh = localStorage.getItem("refresh_token");
			if (!refresh) {
				clearAuthStorage();
				window.location.href = "/";
				return Promise.reject(error);
			}

			try {
				const newToken = await refreshAccessToken(refresh);
				localStorage.setItem("token", newToken);
				original.headers.set("Authorization", `Bearer ${newToken}`);
				return api(original);
			} catch {
				clearAuthStorage();
				window.location.href = "/";
				return Promise.reject(error);
			}
		}

		return Promise.reject(error);
	}
);
