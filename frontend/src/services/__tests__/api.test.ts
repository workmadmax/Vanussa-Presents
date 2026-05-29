/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.test.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 20:21:02 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 20:22:29 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios, {
	AxiosAdapter,
	AxiosError,
	AxiosHeaders,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";
import { api, API_BASE_URL, refreshAccessToken } from "../api";

type RetryRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

function createUnauthorizedError(config: RetryRequestConfig) {
	const response: AxiosResponse = {
		config,
		data: {},
		headers: {},
		status: 401,
		statusText: "Unauthorized",
	};

	return new AxiosError(
		"Unauthorized",
		"ERR_BAD_REQUEST",
		config,
		undefined,
		response
	);
}

describe("api", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		localStorage.clear();
	});

	it("should be defined", () => {
		expect(API_BASE_URL).toBe(
			process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/"
		);
		expect(api.defaults.baseURL).toBe(API_BASE_URL);
	});

	it("refreshes the access token through the configured API base URL", async () => {
		const postSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({
			data: { access: "new-access-token" },
		});

		await expect(refreshAccessToken("refresh-token")).resolves.toBe(
			"new-access-token"
		);
		expect(postSpy).toHaveBeenCalledWith(`${API_BASE_URL}users/token/refresh/`, {
			refresh: "refresh-token",
		});
	});

	it("attaches the stored access token to outgoing API requests", async () => {
		localStorage.setItem("token", "stored-access-token");
		const adapterMock: AxiosAdapter = jest.fn((config) =>
			Promise.resolve({
				config,
				data: {},
				headers: {},
				status: 200,
				statusText: "OK",
			})
		);

		await api.get("/users/profile/", { adapter: adapterMock });

		const requestConfig = adapterMock.mock.calls[0][0];

		expect(AxiosHeaders.from(requestConfig.headers).get("Authorization")).toBe(
			"Bearer stored-access-token"
		);
	});

	it("does not attach Authorization when no access token is stored", async () => {
		const adapterMock: AxiosAdapter = jest.fn((config) =>
			Promise.resolve({
				config,
				data: {},
				headers: {},
				status: 200,
				statusText: "OK",
			})
		);

		await api.get("/users/profile/", { adapter: adapterMock });

		const requestConfig = adapterMock.mock.calls[0][0];

		expect(AxiosHeaders.from(requestConfig.headers).has("Authorization")).toBe(
			false
		);
	});

	it("refreshes an expired access token and retries the original request once", async () => {
		localStorage.setItem("refresh_token", "refresh-token");
		jest.spyOn(axios, "post").mockResolvedValueOnce({
			data: { access: "new-access-token" },
		});

		let requestCount = 0;
		const adapterMock: AxiosAdapter = jest.fn((config) => {
			requestCount += 1;

			if (requestCount === 1) {
				return Promise.reject(
					createUnauthorizedError(config as RetryRequestConfig)
				);
			}

			return Promise.resolve({
				config,
				data: { ok: true },
				headers: {},
				status: 200,
				statusText: "OK",
			});
		});

		const response = await api.get("/users/profile/", { adapter: adapterMock });
		const retryConfig = adapterMock.mock.calls[1][0] as RetryRequestConfig;

		expect(localStorage.getItem("token")).toBe("new-access-token");
		expect(AxiosHeaders.from(retryConfig.headers).get("Authorization")).toBe(
			"Bearer new-access-token"
		);
		expect(retryConfig._retry).toBe(true);
		expect(adapterMock).toHaveBeenCalledTimes(2);
		expect(response.data).toEqual({ ok: true });
	});

	it("clears auth storage when a 401 cannot be refreshed", async () => {
		localStorage.setItem("token", "stale-access-token");
		localStorage.setItem("refresh_token", "stale-refresh-token");
		localStorage.setItem("user", "mdouglas");
		jest.spyOn(axios, "post").mockRejectedValueOnce(new Error("refresh failed"));

		const adapterMock: AxiosAdapter = jest.fn((config) =>
			Promise.reject(createUnauthorizedError(config as RetryRequestConfig))
		);

		await expect(
			api.get("/users/profile/", { adapter: adapterMock })
		).rejects.toThrow("Unauthorized");

		const failedConfig = adapterMock.mock.calls[0][0] as RetryRequestConfig;

		expect(localStorage.getItem("token")).toBeNull();
		expect(localStorage.getItem("refresh_token")).toBeNull();
		expect(localStorage.getItem("user")).toBeNull();
		expect(failedConfig._retry).toBe(true);
	});
});
