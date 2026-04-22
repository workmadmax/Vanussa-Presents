/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenuLogged.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 16:02:38 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:02:47 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Link from "next/link";

type CartMenuLoggedProps = {
	cartCount: number;
	total: number;
	onCheckout: () => void;
	onCartClick: () => void;
};

export function CartMenuLogged({
	cartCount,
	total,
	onCheckout,
	onCartClick,
}: CartMenuLoggedProps) {
	return (
		<>
			<p className="text-sm text-gray-500 text-center">
				<strong>{cartCount}</strong> {cartCount === 1 ? "item" : "itens"} — R${" "}
				{total.toFixed(2)}
			</p>

			<button
				onClick={onCheckout}
				className="w-full bg-pink-500 text-white py-2 rounded-xl
				text-sm hover:bg-pink-600 transition font-semibold"
			>
				Finalizar compra
			</button>

			<Link
				href="/cart"
				onClick={onCartClick}
				className="w-full border py-2 rounded-xl text-sm
				text-gray-600 hover:bg-gray-50 transition text-center block"
			>
				Ver carrinho
			</Link>
		</>
	);
}
