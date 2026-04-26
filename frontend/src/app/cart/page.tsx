/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:40:14 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/26 12:40:03 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import { CartItemCard } from "@/components/cards/cartItens";
import { LoginModal } from "@/components/ui/modal/loginModal";
import { RegisterModal } from "@/components/ui/modal/registerModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function CartPage() {
	const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	const [mounted, setMounted] = useState(false);
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const total = cartItems.reduce(
		(acc, item) => acc + Number(item.price) * item.quantity,
		0
	);

	async function handleCheckout() {
		setLoading(true);
		setError(null);
		try {
			const res = await api.post("/orders/create/", {
				items: cartItems.map((item) => ({
					product_id: item.id,
					quantity: item.quantity,
				})),
			});
			clearCart();
			router.push(`/checkout/${res.data.id}`);
		} catch (err: any) {
			const msg =
				err.response?.data?.detail ||
				err.response?.data?.[0] ||
				"Erro ao criar pedido. Tente novamente.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="max-w-2xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Carrinho 🛒</h1>
				{cartItems.length > 0 && (
					<button
						onClick={clearCart}
						className="text-sm text-gray-400 hover:text-red-500 hover:underline"
					>
						Limpar carrinho
					</button>
				)}
			</div>

			{cartItems.length === 0 ? (
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

			{error && (
				<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
					{error}
				</div>
			)}

			<div className="mt-6 border-t pt-4 flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<span className="text-lg text-gray-600">Total</span>
					<span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
				</div>

				{cartItems.length > 0 && isAuthenticated && (
					<button
						onClick={handleCheckout}
						disabled={loading}
						className="w-full bg-pink-500 hover:bg-pink-600 text-white
            font-semibold py-3 rounded-xl transition disabled:opacity-50"
					>
						{loading ? "Processando..." : "Finalizar compra"}
					</button>
				)}

				{cartItems.length > 0 && !isAuthenticated && (
					<p className="text-center text-sm text-gray-400">
						<button
							onClick={() => setIsLoginOpen(true)}
							className="text-pink-500 hover:underline font-medium"
						>
							Faça login
						</button>{" "}
						para finalizar sua compra
					</p>
				)}
			</div>

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setIsLoginOpen(false)}
				onOpenRegister={() => setIsRegisterOpen(true)}
			/>
			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
			/>
		</main>
	);
}
