/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:18:33 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 11:55:04 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import {
	createContext,
	useState,
	useEffect,
	ReactNode,
	useContext,
	use,
} from "react";

type Product = {
	id: number;
	name: string;
	price: string;
	images: { image: string }[];
};

export type CartItem = Product & {
	quantity: number;
};

type CartContextType = {
	cartItems: CartItem[];
	addToCart: (product: Product) => void;
	removeFromCart: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
	const [cartItems, setCartItems] = useState<CartItem[]>(() => {
		if (typeof window === "undefined") return [];
		try {
			const stored = localStorage.getItem("cartItems");
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});

	useEffect(() => {
		localStorage.setItem("cartItems", JSON.stringify(cartItems));
	}, [cartItems]);

	function addToCart(product: Product) {
		setCartItems((prev) => {
			const existingItem = prev.find((item) => item.id === product.id);
			if (existingItem) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { ...product, quantity: 1 }];
		});
	}
	function updateQuantity(productId: number, quantity: number) {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}
		setCartItems((prev) =>
			prev.map((item) =>
				item.id === productId ? { ...item, quantity } : item,
			),
		);
	}
	function removeFromCart(productId: number) {
		setCartItems((prev) => prev.filter((item) => item.id !== productId));
	}
	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart: () => setCartItems([]),
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) throw new Error("useCart must be used within a CartProvider");
	return context;
};
