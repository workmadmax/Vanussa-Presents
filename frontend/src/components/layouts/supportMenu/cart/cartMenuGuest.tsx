/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenuGuest.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 16:00:22 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:02:10 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

type CartMenuGuestProps = {
	cartCount: number;
	onLoginClick: () => void;
	onCartClick: () => void;
};

export function CartMenuGuest({
	cartCount,
	onLoginClick,
	onCartClick,
}: CartMenuGuestProps) {
	return (
		<>
			<p className="text-sm text-gray-500 text-center">
				Você tem <strong>{cartCount}</strong>{" "}
				{cartCount === 1 ? "item" : "itens"} no carrinho
			</p>

			<p className="text-xs text-gray-400 text-center">
				Faça login para finalizar sua compra
			</p>

			<button
				onClick={onLoginClick}
				className="w-full bg-black text-white py-2
				rounded-xl text-sm hover:opacity-90 transition"
			>
				Entrar ou Cadastrar
			</button>

			<button
				onClick={onCartClick}
				className="w-full border py-2 rounded-xl text-sm
				text-gray-600 hover:bg-gray-50 transition"
			>
				Ver carrinho
			</button>
		</>
	);
}
