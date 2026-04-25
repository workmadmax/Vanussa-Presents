/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 22:24:24 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/24 23:48:04 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState, use } from "react";

type OrderItem = {
	id: number;
	name: string;
	price: number;
	quantity: number;
	product_name: string;
	subtotal: number;
};

type Order = {
	id: number;
	status: string;
	items: OrderItem[];
	total_price: number;
	created_at: string;
};

export default function CheckoutPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const resolvedParams = use(params);
	const { id } = resolvedParams;

	useEffect(() => {
		async function fetchOrder() {
			try {
				const token = localStorage.getItem("token");

				const response = await fetch(
					`http://127.0.0.1:8000/api/orders/${id}/`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (!response.ok) {
					console.error("Failed to fetch order:", response.statusText);
					setOrder(null);
					return;
				}

				const data = await response.json();
				setOrder(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}

		fetchOrder();
	}, [id]);

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto p-10">
				<p>Carregando pedido...</p>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="max-w-4xl mx-auto p-10">
				<p>Pedido não encontrado.</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-10">
			<h1 className="text-3xl font-bold mb-6">Checkout Pedido #{order.id}</h1>

			<div className="bg-white rounded-2xl shadow p-6 space-y-4">
				<p>
					<strong>Status:</strong> {order.status}
				</p>

				<p>
					<strong>Total:</strong> R$ {order.total_price}
				</p>

				<hr />

				<h2 className="text-xl font-semibold">Itens</h2>

				<div className="space-y-3">
					{order.items?.map((item) => (
						<div
							key={item.id}
							className="border rounded-xl p-4 flex justify-between"
						>
							<div>
								<p>{item.product_name}</p>
								<p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
							</div>

							<p>R$ {item.subtotal}</p>
						</div>
					))}
				</div>

				<button
					className="w-full bg-pink-500 text-white py-3 
				rounded-xl font-semibold hover:bg-pink-600"
				>
					Ir para pagamento
				</button>
			</div>
		</div>
	);
}
