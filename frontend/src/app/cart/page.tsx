/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:40:14 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/24 23:55:57 by mdouglas         ###   ########.fr       */
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

/* ================= MAIN PAGE ================= */

export default function CartPage() {
	const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	const [mounted, setMounted] = useState(false);
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const total = cartItems.reduce(
		(acc, item) => acc + Number(item.price) * item.quantity,
		0
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

			<CartTotal
				total={total}
				isAuthenticated={isAuthenticated}
				hasItems={cartItems.length > 0}
				onCheckout={() => router.push("/checkout")}
				onLoginClick={() => setIsLoginOpen(true)}
			/>

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

function CartTotal({
	total,
	isAuthenticated,
	hasItems,
	onCheckout,
	onLoginClick,
}: {
	total: number;
	isAuthenticated: boolean;
	hasItems: boolean;
	onCheckout: () => void;
	onLoginClick: () => void;
}) {
	return (
		<div className="mt-6 border-t pt-4 flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<span className="text-lg text-gray-600">Total</span>
				<span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
			</div>

			{hasItems && isAuthenticated && (
				<button
					onClick={onCheckout}
					className="w-full bg-pink-500 hover:bg-pink-600
					text-white font-semibold py-3 rounded-xl transition"
				>
					Finalizar compra
				</button>
			)}

			{hasItems && !isAuthenticated && (
				<p className="text-center text-sm text-gray-400">
					<button
						onClick={onLoginClick}
						className="text-pink-500 hover:underline font-medium"
					>
						Faça login
					</button>{" "}
					para finalizar sua compra
				</p>
			)}
		</div>
	);
}
