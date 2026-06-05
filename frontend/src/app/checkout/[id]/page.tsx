"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuth } from "@/context/authContext";
import type { CheckoutAddress, Order } from "@/types";
import {
	formatCep,
	getOrderStatusInfo,
	initiateCheckoutPayment,
	isCheckoutAddressValid,
	onlyDigits,
} from "@/services/checkout";

type ViaCepResponse = {
	erro?: boolean;
	logradouro?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
};

const emptyAddress: CheckoutAddress = {
	delivery_street: "",
	delivery_neighborhood: "",
	delivery_city: "",
	delivery_state: "",
	delivery_postal_code: "",
};

function getCheckoutErrorMessage(error: unknown) {
	const data = (
		error as { response?: { data?: Record<string, string | string[]> } }
	).response?.data;

	if (!data) {
		return "Não foi possível iniciar o pagamento. Tente novamente.";
	}
	const first = Object.values(data)[0];
	if (Array.isArray(first)) {
		return first[0] ?? "Revise os dados do checkout.";
	}
	return first ?? "Revise os dados do checkout.";
}

export default function CheckoutPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const id = params?.id;

	const [order, setOrder] = useState<Order | null>(null);
	const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);
	const [lgpdConsent, setLgpdConsent] = useState(false);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [cepLoading, setCepLoading] = useState(false);
	const [cepMessage, setCepMessage] = useState("");
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentError, setPaymentError] = useState("");

	useEffect(() => {
		if (authLoading) {
			return;
		}
		if (!isAuthenticated) {
			router.push("/");
			return;
		}
		if (!id) {
			return;
		}

		api
			.get(`/orders/${id}/`)
			.then((res) => {
				const loadedOrder = res.data as Order;
				setOrder(loadedOrder);
				setAddress({
					delivery_street: loadedOrder.delivery_street ?? "",
					delivery_neighborhood: loadedOrder.delivery_neighborhood ?? "",
					delivery_city: loadedOrder.delivery_city ?? "",
					delivery_state: loadedOrder.delivery_state ?? "",
					delivery_postal_code: formatCep(loadedOrder.delivery_postal_code ?? ""),
				});
				setLgpdConsent(Boolean(loadedOrder.lgpd_consent));
			})
			.catch((err) => {
				if (err.response?.status === 404) {
					setNotFound(true);
				}
			})
			.finally(() => setLoading(false));
	}, [id, isAuthenticated, authLoading, router]);

	const statusInfo = getOrderStatusInfo(order?.status ?? "");
	const canPay = useMemo(
		() =>
			Boolean(order) &&
			isCheckoutAddressValid(address) &&
			lgpdConsent &&
			!paymentLoading,
		[address, lgpdConsent, order, paymentLoading]
	);

	function updateAddress(field: keyof CheckoutAddress, value: string) {
		setPaymentError("");
		setAddress((current) => ({
			...current,
			[field]:
				field === "delivery_state"
					? value.toUpperCase().slice(0, 2)
					: field === "delivery_postal_code"
						? formatCep(value)
						: value,
		}));
	}

	function handleCepChange(value: string) {
		const formattedCep = formatCep(value);
		updateAddress("delivery_postal_code", formattedCep);
		const cep = onlyDigits(formattedCep);
		if (cep.length !== 8) {
			setCepMessage("");
			return;
		}

		setCepLoading(true);
		setCepMessage("");

		fetch(`https://viacep.com.br/ws/${cep}/json/`)
			.then((res) => res.json() as Promise<ViaCepResponse>)
			.then((data) => {
				if (data.erro) {
					setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
					return;
				}
				setAddress((current) => ({
					...current,
					delivery_street: data.logradouro || current.delivery_street,
					delivery_neighborhood: data.bairro || current.delivery_neighborhood,
					delivery_city: data.localidade || current.delivery_city,
					delivery_state: data.uf || current.delivery_state,
				}));
			})
			.catch(() => {
				setCepMessage("Não foi possível buscar o CEP. Preencha manualmente.");
			})
			.finally(() => setCepLoading(false));
	}

	const displayedCepMessage =
		onlyDigits(address.delivery_postal_code).length === 8 ? cepMessage : "";

	async function handlePayment() {
		if (!canPay || !order) {
			return;
		}

		setPaymentLoading(true);
		setPaymentError("");
		try {
			const payment = await initiateCheckoutPayment({
				order_id: order.id,
				...address,
				delivery_postal_code: formatCep(address.delivery_postal_code),
				lgpd_consent: lgpdConsent,
			});
			window.location.assign(payment.init_point);
		} catch (err) {
			setPaymentError(getCheckoutErrorMessage(err));
		} finally {
			setPaymentLoading(false);
		}
	}

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
					Ver meus pedidos
				</Link>
			</main>
		);
	}

	return (
		<main className="max-w-2xl mx-auto p-6">
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => router.push("/orders")}
					className="text-sm text-gray-500 hover:text-pink-500 transition"
				>
					Meus pedidos
				</button>
				<h1 className="text-2xl font-bold text-pink-600">Checkout #{order.id}</h1>
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

				<div className="flex justify-between items-center border-t pt-4">
					<span className="text-gray-600 font-medium">Total</span>
					<span className="text-xl font-bold text-pink-600">
						R$ {Number(order.total_price).toFixed(2)}
					</span>
				</div>

				<section className="space-y-4 border-t pt-5">
					<h2 className="text-lg font-semibold text-gray-800">
						Endereço de entrega
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-sm font-medium text-gray-700">CEP</span>
							<input
								value={address.delivery_postal_code}
								onChange={(event) =>
									handleCepChange(event.target.value)
								}
								inputMode="numeric"
								placeholder="01001-000"
								className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
							/>
						</label>
						<label className="space-y-1">
							<span className="text-sm font-medium text-gray-700">UF</span>
							<input
								value={address.delivery_state}
								onChange={(event) =>
									updateAddress("delivery_state", event.target.value)
								}
								placeholder="SP"
								className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
							/>
						</label>
						<label className="space-y-1 sm:col-span-2">
							<span className="text-sm font-medium text-gray-700">Rua</span>
							<input
								value={address.delivery_street}
								onChange={(event) =>
									updateAddress("delivery_street", event.target.value)
								}
								className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
							/>
						</label>
						<label className="space-y-1">
							<span className="text-sm font-medium text-gray-700">Bairro</span>
							<input
								value={address.delivery_neighborhood}
								onChange={(event) =>
									updateAddress("delivery_neighborhood", event.target.value)
								}
								className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
							/>
						</label>
						<label className="space-y-1">
							<span className="text-sm font-medium text-gray-700">Cidade</span>
							<input
								value={address.delivery_city}
								onChange={(event) =>
									updateAddress("delivery_city", event.target.value)
								}
								className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
							/>
						</label>
					</div>
					{cepLoading && (
						<p className="text-xs text-gray-400">Buscando endereço...</p>
					)}
					{displayedCepMessage && (
						<p className="text-xs text-gray-500">{displayedCepMessage}</p>
					)}
				</section>

				<label className="flex items-start gap-3 border-t pt-5">
					<input
						type="checkbox"
						checked={lgpdConsent}
						onChange={(event) => setLgpdConsent(event.target.checked)}
						className="mt-1 h-4 w-4 accent-pink-500"
					/>
					<span className="text-sm text-gray-600">
						Autorizo o uso dos meus dados para processar este pedido, conforme a{" "}
						<Link href="/privacy" className="text-pink-500 hover:underline">
							política de privacidade
						</Link>
						.
					</span>
				</label>

				{paymentError && (
					<p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
						{paymentError}
					</p>
				)}

				<button
					type="button"
					disabled={!canPay}
					onClick={handlePayment}
					className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition"
				>
					{paymentLoading ? "Redirecionando..." : "Ir para pagamento"}
				</button>
			</div>
		</main>
	);
}
