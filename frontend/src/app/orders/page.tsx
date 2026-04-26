/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/26 11:24:08 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/26 11:36:45 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuth } from "@/context/authContext";

type OrderItem = {
	id: number;
	product_name: string;
	product_slug: string;
	quantity: number;
	price: string;
	subtotal_price: string;
};

type Order = {
	id: number;
	status: string;
	total_price: string;
	created_at: string;
	updated_at: string;
	items: OrderItem[];
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
	PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
	PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
	SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
	DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
	CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();

	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState<number | null>(null);

	useEffect(() => {
		if (authLoading) return;
		if (!isAuthenticated) {
			router.push("/");
			return;
		}
		api
			.get("/orders/my-orders/")
			.then((res) => setOrders(res.data))
			.finally(() => setLoading(false));
	}, [isAuthenticated, authLoading]);

	if (authLoading || loading) {
		return (
			<main className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="h-24 bg-gray-200 rounded-xl animate-pulse mb-3"
					/>
				))}
			</main>
		);
	}

	return (
		<main className="max-w-2xl mx-auto p-6">
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => router.push("/profile")}
					className="text-sm text-gray-500 hover:text-pink-500 transition"
				>
					← Perfil
				</button>
				<h1 className="text-2xl font-bold text-pink-600">Meus Pedidos</h1>
			</div>

			{orders.length === 0 ? (
				<div className="bg-white rounded-2xl shadow p-10 text-center">
					<p className="text-gray-500 mb-4">Você ainda não tem pedidos.</p>
					<Link
						href="/"
						className="bg-pink-500 text-white px-6 py-2
						rounded-xl text-sm hover:bg-pink-600 transition"
					>
						Ver produtos
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{orders.map((order) => {
						const statusInfo = STATUS_LABEL[order.status] ?? {
							label: order.status,
							color: "bg-gray-100 text-gray-600",
						};
						const isOpen = expanded === order.id;

						return (
							<div
								key={order.id}
								className="bg-white rounded-2xl shadow overflow-hidden"
							>
								<button
									onClick={() => setExpanded(isOpen ? null : order.id)}
									className="w-full flex items-center justify-between p-4
									hover:bg-gray-50 transition text-left"
								>
									<div className="flex items-center gap-3">
										<span className="font-semibold text-gray-800">
											Pedido #{order.id}
										</span>
										<span
											className={`text-xs font-medium px-2 py-1
												rounded-full ${statusInfo.color}`}
										>
											{statusInfo.label}
										</span>
									</div>
									<div className="flex items-center gap-4">
										<span className="font-bold text-pink-600">
											R$ {Number(order.total_price).toFixed(2)}
										</span>
										<span className="text-xs text-gray-400">
											{new Date(order.created_at).toLocaleDateString("pt-BR")}
										</span>
										<span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
									</div>
								</button>

								{isOpen && (
									<div className="border-t divide-y">
										{order.items.map((item) => (
											<div
												key={item.id}
												className="flex justify-between items-center px-4 py-3"
											>
												<div>
													<p className="text-sm font-medium">
														{item.product_name}
													</p>
													<p className="text-xs text-gray-400">
														Qtd: {item.quantity}
													</p>
												</div>
												<p className="text-sm font-semibold text-gray-700">
													R$ {Number(item.subtotal_price).toFixed(2)}
												</p>
											</div>
										))}
										<div className="px-4 py-3 flex justify-end">
											<Link
												href={`/checkout/${order.id}`}
												className="text-sm text-pink-500 hover:underline"
											>
												Ver detalhes →
											</Link>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</main>
	);
}
