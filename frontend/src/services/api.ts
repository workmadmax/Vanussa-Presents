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

import axios from "axios";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/",
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
	async (error) => {
		const original = error.config;

		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;

			const refresh = localStorage.getItem("refresh_token");
			if (!refresh) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				localStorage.removeItem("refresh_token");
				window.location.href = "/";
				return Promise.reject(error);
			}

			try {
				const res = await axios.post(
					`${
						process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/"
					}users/token/refresh/`,
					{ refresh }
				);
				const newToken = res.data.access;
				localStorage.setItem("token", newToken);
				original.headers.Authorization = `Bearer ${newToken}`;
				return api(original);
			} catch {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				localStorage.removeItem("refresh_token");
				window.location.href = "/";
				return Promise.reject(error);
			}
		}

		return Promise.reject(error);
	}
);
