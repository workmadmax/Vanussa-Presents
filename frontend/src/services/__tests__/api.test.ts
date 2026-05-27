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

type InterceptorHandler<TValue, TError = unknown> = {
	fulfilled?: ((value: TValue) => TValue | Promise<TValue>) | null;
	rejected?: ((error: TError) => Promise<AxiosResponse>) | null;
};

type InterceptorManager<TValue, TError = unknown> = {
	handlers: InterceptorHandler<TValue, TError>[];
};

function getRequestInterceptor() {
	const manager = api.interceptors.request as unknown as InterceptorManager<
		InternalAxiosRequestConfig
	>;
	const fulfilled = manager.handlers[0]?.fulfilled;

	if (!fulfilled) {
		throw new Error("Request interceptor is not registered");
	}

	return fulfilled;
}

function getResponseErrorInterceptor() {
	const manager = api.interceptors.response as unknown as InterceptorManager<
		AxiosResponse,
		AxiosError
	>;
	const rejected = manager.handlers[0]?.rejected;

	if (!rejected) {
		throw new Error("Response interceptor is not registered");
	}

	return rejected;
}

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
		const config = {
			headers: new AxiosHeaders(),
		} as InternalAxiosRequestConfig;

		const result = await getRequestInterceptor()(config);

		expect(AxiosHeaders.from(result.headers).get("Authorization")).toBe(
			"Bearer stored-access-token"
		);
	});

	it("refreshes an expired access token and retries the original request once", async () => {
		localStorage.setItem("refresh_token", "refresh-token");
		jest.spyOn(axios, "post").mockResolvedValueOnce({
			data: { access: "new-access-token" },
		});

		const adapterMock = jest.fn();
		const originalConfig: RetryRequestConfig = {
			adapter: adapterMock as unknown as AxiosAdapter,
			headers: new AxiosHeaders(),
			method: "get",
			url: "/users/profile/",
		};

		adapterMock.mockResolvedValueOnce({
			config: originalConfig,
			data: { ok: true },
			headers: {},
			status: 200,
			statusText: "OK",
		});

		const response = await getResponseErrorInterceptor()(
			createUnauthorizedError(originalConfig)
		);

		expect(localStorage.getItem("token")).toBe("new-access-token");
		expect(AxiosHeaders.from(originalConfig.headers).get("Authorization")).toBe(
			"Bearer new-access-token"
		);
		expect(originalConfig._retry).toBe(true);
		expect(adapterMock).toHaveBeenCalledTimes(1);
		expect(response.data).toEqual({ ok: true });
	});

	it("clears auth storage when a 401 cannot be refreshed", async () => {
		localStorage.setItem("token", "stale-access-token");
		localStorage.setItem("refresh_token", "stale-refresh-token");
		localStorage.setItem("user", "mdouglas");
		jest.spyOn(axios, "post").mockRejectedValueOnce(new Error("refresh failed"));

		const originalConfig: RetryRequestConfig = {
			headers: new AxiosHeaders(),
			method: "get",
			url: "/users/profile/",
		};

		await expect(
			getResponseErrorInterceptor()(createUnauthorizedError(originalConfig))
		).rejects.toThrow("Unauthorized");

		expect(localStorage.getItem("token")).toBeNull();
		expect(localStorage.getItem("refresh_token")).toBeNull();
		expect(localStorage.getItem("user")).toBeNull();
		expect(originalConfig._retry).toBe(true);
	});
});
