/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   fetchWithAuth.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/25 22:25:13 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/25 23:08:13 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
	let token = localStorage.getItem("token");

	const headers = {
		...options.headers,
		"Content-Type": "application/json",
		Authorization: token ? `Bearer ${token}` : "",
	} as HeadersInit;

	let response = await fetch(url, { ...options, headers });

	if (response.status === 401) {
		const refreshToken = localStorage.getItem("refresh_token");

		if (refreshToken) {
			try {
				const refreshResponse = await fetch(
					"http://127.0.0.1:8000/api/users/token/refresh/",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ refresh: refreshToken }),
					}
				);

				if (refreshResponse.ok) {
					const data = await refreshResponse.json();

					localStorage.setItem("token", data.access);
					token = data.access;

					if (data.refresh) {
						localStorage.setItem("refresh_token", data.refresh);
					}

					const newHeaders = {
						...headers,
						Authorization: `Bearer ${token}`,
					};

					response = await fetch(url, { ...options, headers: newHeaders });
				} else {
					throw new Error("Sessão totalmente expirada");
				}
			} catch (error) {
				localStorage.removeItem("token");
				localStorage.removeItem("refresh_token");
				window.location.href = "/login";
			}
		}
	}
	return response;
}
