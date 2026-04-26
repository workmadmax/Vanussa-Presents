/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:18:33 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/25 23:33:53 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import {
	createContext,
	useState,
	useEffect,
	ReactNode,
	useContext,
	useMemo,
} from "react";

import { Product } from "@/types";

const STORAGE_KEY = "cartItems";

export type CartItem = Product & {
	quantity: number;
};

type CartContextType = {
	cartItems: CartItem[];
	totalItems: number;
	subtotal: number;
	addToCart: (product: Product) => void;
	removeFromCart: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored) {
			setCartItems(JSON.parse(stored));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
	}, [cartItems]);

	function addToCart(product: Product) {
		setCartItems((prev) => {
			const item = prev.find((p) => p.id === product.id);

			if (item) {
				return prev.map((p) =>
					p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
				);
			}
			return [...prev, { ...product, quantity: 1 }];
		});
	}

	function removeFromCart(productId: number) {
		setCartItems((prev) => prev.filter((item) => item.id !== productId));
	}

	function updateQuantity(productId: number, quantity: number) {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}

		setCartItems((prev) =>
			prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
		);
	}

	function clearCart() {
		setCartItems([]);
	}

	const totalItems = useMemo(
		() => cartItems.reduce((acc, item) => acc + item.quantity, 0),
		[cartItems]
	);

	const subtotal = useMemo(
		() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
		[cartItems]
	);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				totalItems,
				subtotal,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);

	if (!context) {
		throw new Error("useCart must be used within CartProvider");
	}
	return context;
}
