"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { getOrderStatusInfo } from "@/services/checkout";
import type { Order } from "@/types";

function CheckoutSuccessContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("order_id");
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(Boolean(orderId));
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (!orderId) {
			return;
		}

		api
			.get(`/orders/${orderId}/`)
			.then((res) => setOrder(res.data))
			.catch(() => setNotFound(true))
			.finally(() => setLoading(false));
	}, [orderId]);

	if (loading) {
		return (
			<main className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
				<div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
			</main>
		);
	}

	if (!orderId || notFound || !order) {
		return (
			<main className="max-w-2xl mx-auto p-6 text-center">
				<p className="text-gray-500 mb-4">Pedido não encontrado.</p>
				<Link href="/orders" className="text-pink-500 hover:underline text-sm">
					Ver meus pedidos
				</Link>
			</main>
		);
	}

	const statusInfo = getOrderStatusInfo(order.status);

	return (
		<main className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold text-pink-600 mb-6">
				Pagamento recebido
			</h1>
			<div className="bg-white rounded-2xl shadow p-6 space-y-5">
				<div className="flex items-center justify-between">
					<span className="font-semibold text-gray-800">Pedido #{order.id}</span>
					<span
						className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
					>
						{statusInfo.label}
					</span>
				</div>
				<div className="divide-y border rounded-xl overflow-hidden">
					{order.items.map((item, index) => (
						<div
							key={`${item.product_slug}-${index}`}
							className="flex justify-between px-4 py-3"
						>
							<span className="text-sm text-gray-700">
								{item.quantity} x {item.product_name}
							</span>
							<span className="text-sm font-semibold text-gray-700">
								R$ {Number(item.subtotal_price).toFixed(2)}
							</span>
						</div>
					))}
				</div>
				<div className="flex justify-between items-center border-t pt-4">
					<span className="text-gray-600 font-medium">Total</span>
					<span className="text-xl font-bold text-pink-600">
						R$ {Number(order.total_price).toFixed(2)}
					</span>
				</div>
				<Link
					href={`/orders/${order.id}`}
					className="block w-full rounded-xl bg-pink-500 py-3 text-center font-semibold text-white hover:bg-pink-600 transition"
				>
					Ver detalhes do pedido
				</Link>
			</div>
		</main>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<main className="max-w-2xl mx-auto p-6">
					<div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
					<div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
				</main>
			}
		>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
