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

import { describe } from "node:test";
import { api } from "../api";

describe("api", () => {
	it("should be defined", () => {
		expect(api.defaults.baseURL).toBe("http://127.0.0.1:8000/api/");
	});
});
