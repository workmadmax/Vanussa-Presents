/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 22:24:24 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/31 19:25:35 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* frontend/src/app/checkout/[id]/page.tsx" */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuth } from "@/context/authContext";

type OrderItem = {
	product_name: string;
	product_slug: string;
	quantity: number;
	price: string;
	subtotal_price: string;
};

type Order = {
	id: number;
	status: string;
	items: OrderItem[];
	total_price: string;
	created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
	PENDING: {
		label: "Aguardando pagamento",
		color: "bg-yellow-100 text-yellow-700",
	},
	PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
	SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
	DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
	CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function CheckoutPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const { id } = use(params);

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (authLoading) {
			return;
		}
		if (!isAuthenticated) {
			router.push("/");
			return;
		}

		api
			.get(`/orders/${id}/`)
			.then((res) => setOrder(res.data))
			.catch((err) => {
				if (err.response?.status === 404) {
					setNotFound(true);
				}
			})
			.finally(() => setLoading(false));
	}, [id, isAuthenticated, authLoading, router]);

	if (authLoading || loading) {
		return (
			<main className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
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
					← Ver meus pedidos
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
					← Meus pedidos
				</button>
				<h1 className="text-2xl font-bold text-pink-600">Pedido #{order.id}</h1>
			</div>

			<div className="bg-white rounded-2xl shadow p-6 space-y-6">
				{/* status + data */}
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

				{/* itens */}
				<div className="divide-y border rounded-xl overflow-hidden">
					{order.items.map((item, index) => (
						<div
							key={`${item.product_slug}-${index}`}
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

				{/* total */}
				<div className="flex justify-between items-center border-t pt-4">
					<span className="text-gray-600 font-medium">Total</span>
					<span className="text-xl font-bold text-pink-600">
						R$ {Number(order.total_price).toFixed(2)}
					</span>
				</div>

				{/* CTA — desabilitado até feature de pagamento */}
				<div className="space-y-2">
					<button
						disabled
						className="w-full bg-pink-500 text-white py-3 rounded-xl
            font-semibold opacity-50 cursor-not-allowed"
					>
						Ir para pagamento
					</button>
					<p className="text-center text-xs text-gray-400">
						Pagamento disponível em breve
					</p>
				</div>
			</div>
		</main>
	);
}
