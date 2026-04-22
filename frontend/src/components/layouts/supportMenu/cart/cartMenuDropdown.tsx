/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenuDropdown.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 15:58:44 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:04:21 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

export function CartMenuDropdown({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="absolute right-0 top-12 w-72 bg-white 
		rounded-2xl shadow-xl border border-gray-100 z-50 p-4 flex flex-col gap-3"
		>
			{children}
		</div>
	);
}
