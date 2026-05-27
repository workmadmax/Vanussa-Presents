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

import axios from "axios";
import { describe } from "node:test";
import { api, API_BASE_URL, refreshAccessToken } from "../api";

describe("api", () => {
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
});
