/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/31 17:33:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/31 17:33:54 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function OrderDetailPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const id = params?.id;

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (authLoading) return;
		if (!isAuthenticated) {
			router.push("/");
			return;
		}
		if (!id) return;

		api
			.get(`/orders/${id}/`)
			.then((res) => setOrder(res.data))
			.catch((err) => {
				if (err.response?.status === 404) setNotFound(true);
			})
			.finally(() => setLoading(false));
	}, [isAuthenticated, authLoading, id, router]);

	if (authLoading || loading) {
		return (
			<main className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="h-16 bg-gray-200 rounded-xl animate-pulse mb-3"
					/>
				))}
			</main>
		);
	}

	if (notFound || !order) {
		return (
			<main className="max-w-2xl mx-auto p-6 text-center">
				<p className="text-gray-500 mb-4">Pedido não encontrado.</p>
				<Link href="/orders" className="text-pink-500 hover:underline text-sm">
					← Voltar para pedidos
				</Link>
			</main>
		);
	}

	const statusInfo = STATUS_LABEL[order.status] ?? {
		label: order.status,
		color: "bg-gray-100 text-gray-600",
	};

	return (
		<main className="max-w-2xl mx-auto p-6">
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => router.push("/orders")}
					className="text-sm text-gray-500 hover:text-pink-500 transition"
				>
					← Pedidos
				</button>
				<h1 className="text-2xl font-bold text-pink-600">Pedido #{order.id}</h1>
			</div>

			<div className="bg-white rounded-2xl shadow p-6 space-y-6">
				<div className="flex items-center justify-between">
					<span
						className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
					>
						{statusInfo.label}
					</span>
					<span className="text-xs text-gray-400">
						{new Date(order.created_at).toLocaleDateString("pt-BR", {
							day: "2-digit",
							month: "long",
							year: "numeric",
						})}
					</span>
				</div>

				<div className="divide-y border rounded-xl overflow-hidden">
					{order.items.map((item) => (
						<div
							key={item.id}
							className="flex justify-between items-center px-4 py-3"
						>
							<div>
								<p className="text-sm font-medium text-gray-800">
									{item.product_name}
								</p>
								<p className="text-xs text-gray-400">
									{item.quantity} × R$ {Number(item.price).toFixed(2)}
								</p>
							</div>
							<p className="text-sm font-semibold text-gray-700">
								R$ {Number(item.subtotal_price).toFixed(2)}
							</p>
						</div>
					))}
				</div>

				<div className="flex justify-between items-center border-t pt-4">
					<span className="text-gray-600 font-medium">Total</span>
					<span className="text-xl font-bold text-pink-600">
						R$ {Number(order.total_price).toFixed(2)}
					</span>
				</div>

				<p className="text-xs text-gray-400 text-right">
					Última atualização:{" "}
					{new Date(order.updated_at).toLocaleDateString("pt-BR")}
				</p>
			</div>
		</main>
	);
}
