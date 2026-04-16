/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 22:09:28 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 20:52:28 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { api }  from "./api";

export async function login(username: string, password: string) {
    const response = await api.post("/users/login/", { username, password });
    return response.data;
}
