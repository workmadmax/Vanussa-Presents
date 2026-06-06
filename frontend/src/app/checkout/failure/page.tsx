"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { getOrderStatusInfo } from "@/services/checkout";
import type { Order } from "@/types";

function CheckoutFailureContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("order_id");
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(Boolean(orderId));

	useEffect(() => {
		if (!orderId) {
			return;
		}

		api
			.get(`/orders/${orderId}/`)
			.then((res) => setOrder(res.data))
			.catch(() => setOrder(null))
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

	const statusInfo = order ? getOrderStatusInfo(order.status) : null;

	return (
		<main className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold text-pink-600 mb-6">
				Pagamento não concluído
			</h1>
			<div className="bg-white rounded-2xl shadow p-6 space-y-5">
				<p className="text-gray-600">
					Não recebemos a confirmação do pagamento. Você pode tentar novamente
					ou voltar para seus pedidos.
				</p>
				{order && statusInfo && (
					<div className="flex items-center justify-between rounded-xl border px-4 py-3">
						<span className="font-semibold text-gray-800">Pedido #{order.id}</span>
						<span
							className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
						>
							{statusInfo.label}
						</span>
					</div>
				)}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{orderId && (
						<Link
							href={`/checkout/${orderId}`}
							className="rounded-xl bg-pink-500 py-3 text-center font-semibold text-white hover:bg-pink-600 transition"
						>
							Tentar novamente
						</Link>
					)}
					<Link
						href="/orders"
						className="rounded-xl border border-pink-200 py-3 text-center font-semibold text-pink-600 hover:bg-pink-50 transition"
					>
						Ver meus pedidos
					</Link>
				</div>
			</div>
		</main>
	);
}

export default function CheckoutFailurePage() {
	return (
		<Suspense
			fallback={
				<main className="max-w-2xl mx-auto p-6">
					<div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
					<div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
				</main>
			}
		>
			<CheckoutFailureContent />
		</Suspense>
	);
}
