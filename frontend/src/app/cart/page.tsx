/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:40:14 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 11:55:53 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useCart } from "@/context/cartContext";
import { CartItemCard } from "@/components/cards/cartItens";
import { useEffect, useState } from "react";

/* ================= MAIN PAGE ================= */

export default function CartPage() {
	const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const total = cartItems.reduce(
		(acc, item) => acc + Number(item.price) * item.quantity,
		0,
	);

	return (
		<main className="max-w-2xl mx-auto p-6">
			<CartHeader itemCount={cartItems.length} onClear={clearCart} />

			{cartItems.length === 0 ? (
				<EmptyCart />
			) : (
				cartItems.map((item) => (
					<CartItemCard
						key={item.id}
						item={item}
						onRemove={removeFromCart}
						onUpdateQuantity={updateQuantity}
					/>
				))
			)}

			<CartTotal total={total} />
		</main>
	);
}

/* ================= UI COMPONENTS ================= */

function CartHeader({
	itemCount,
	onClear,
}: {
	itemCount: number;
	onClear: () => void;
}) {
	return (
		<div className="flex items-center justify-between mb-6">
			<h1 className="text-2xl font-bold">Carrinho 🛒</h1>
			{itemCount > 0 && (
				<button
					onClick={onClear}
					className="text-sm text-gray-400 hover:text-red-500 hover:underline"
				>
					Limpar carrinho
				</button>
			)}
		</div>
	);
}

function EmptyCart() {
	return (
		<div className="text-center py-16 text-gray-400">
			<p className="text-4xl mb-3">🛒</p>
			<p className="text-lg">Seu carrinho está vazio</p>
			<a
				href="/"
				className="text-pink-500 hover:underline text-sm mt-2 inline-block"
			>
				Continuar comprando
			</a>
		</div>
	);
}

function CartTotal({ total }: { total: number }) {
	return (
		<div className="mt-6 border-t pt-4 flex justify-between items-center">
			<span className="text-lg text-gray-600">Total</span>
			<span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
		</div>
	);
}
