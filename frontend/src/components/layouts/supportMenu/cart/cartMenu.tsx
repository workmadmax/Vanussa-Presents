/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenu.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 16:03:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/25 13:27:43 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartMenu } from "../hooks/useCartMenu";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import { CartMenuDropdown } from "./cartMenuDropdown";
import { CartMenuGuest } from "./cartMenuGuest";
import { CartMenuLogged } from "./cartMenuLogged";

type CartMenuProps = {
	children: React.ReactNode;
	onLoginClick: () => void;
};

export function CartMenu({ children, onLoginClick }: CartMenuProps) {
	const { isOpen, toggleMenu, closeMenu } = useCartMenu();
	const menuRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const { cartItems } = useCart();
	const { isAuthenticated } = useAuth();

	const total = cartItems.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0
	);
	useClickOutside(menuRef, () => {
		if (isOpen) {
			closeMenu();
		}
	});

	function handleCartClick() {
		closeMenu();
		router.push("/cart");
	}

	async function handleCheckout() {
		try {
			const token = localStorage.getItem("token");

			if (!token) {
				onLoginClick();
				return;
			}

			const response = await fetch("http://127.0.0.1:8000/api/orders/create/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					items: cartItems.map((item) => ({
						product_id: item.id,
						quantity: item.quantity,
					})),
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao criar pedido");
			}

			const order = await response.json();

			closeMenu();

			router.push(`/checkout/${order.id}`);
		} catch (error) {
			console.error(error);
			alert("Erro ao finalizar compra");
		}
	}

	function handleLoginClick() {
		closeMenu();
		onLoginClick();
	}

	return (
		<div ref={menuRef} className="relative font-sans z-50">
			<button
				onClick={toggleMenu}
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className="cursor-pointer transition-transform duration-200
				active:scale-95 bg-transparent border-none p-0 w-full text-left"
			>
				{children}
			</button>

			{isOpen && (
				<CartMenuDropdown>
					{isAuthenticated ? (
						<CartMenuLogged
							cartCount={cartItems.length}
							total={total}
							onCheckout={handleCheckout}
							onCartClick={handleCartClick}
						/>
					) : (
						<CartMenuGuest
							cartCount={cartItems.length}
							onLoginClick={handleLoginClick}
							onCartClick={handleCartClick}
						/>
					)}
				</CartMenuDropdown>
			)}
		</div>
	);
}
