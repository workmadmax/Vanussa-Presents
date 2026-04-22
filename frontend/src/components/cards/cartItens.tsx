/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartItens.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 11:04:43 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:43:13 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/context/cartContext";

/* ================= TYPES ================= */

type CartItemProps = {
	item: CartItemType;
	onRemove: (id: number) => void;
	onUpdateQuantity: (id: number, quantity: number) => void;
};

/* ================= MAIN COMPONENT ================= */

export function CartItemCard({
	item,
	onRemove,
	onUpdateQuantity,
}: CartItemProps) {
	const price = Number(item.price);
	const subtotal = price * item.quantity;

	return (
		<div
			className="flex items-center gap-4 border 
		rounded-2xl p-4 mb-4 shadow-sm bg-white"
		>
			<ProductImage image={item.images?.[0]?.image} name={item.name} />

			<div className="flex flex-col flex-1 gap-1">
				<h2 className="font-semibold text-gray-800">{item.name}</h2>
				<p className="text-sm text-gray-500">R$ {price.toFixed(2)} cada</p>
				<QuantityControl
					quantity={item.quantity}
					onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
					onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
				/>
			</div>

			<div className="flex flex-col items-end gap-2">
				<p className="font-bold text-gray-800">R$ {subtotal.toFixed(2)}</p>
				<RemoveButton onRemove={() => onRemove(item.id)} />
			</div>
		</div>
	);
}

/* ================= UI COMPONENTS ================= */

function ProductImage({ image, name }: { image?: string; name: string }) {
	if (!image) return null;

	return (
		<div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0">
			<Image
				src={image}
				alt={name}
				fill
				sizes="80px"
				className="object-cover"
			/>
		</div>
	);
}

function QuantityControl({
	quantity,
	onDecrease,
	onIncrease,
}: {
	quantity: number;
	onDecrease: () => void;
	onIncrease: () => void;
}) {
	return (
		<div className="flex items-center gap-2 mt-1">
			<button
				onClick={onDecrease}
				className="w-7 h-7 rounded-full border text-gray-600
				hover:bg-gray-100 flex items-center justify-center"
			>
				−
			</button>
			<span className="text-sm font-medium w-4 text-center">{quantity}</span>
			<button
				onClick={onIncrease}
				className="w-7 h-7 rounded-full border text-gray-600
				hover:bg-gray-100 flex items-center justify-center"
			>
				+
			</button>
		</div>
	);
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
	return (
		<button
			onClick={onRemove}
			className="text-xs text-red-400 hover:text-red-600 hover:underline"
		>
			Remover
		</button>
	);
}
