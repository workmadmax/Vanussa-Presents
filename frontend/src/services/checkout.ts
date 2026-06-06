import { api } from "@/services/api";
import type {
	CheckoutAddress,
	CheckoutPaymentRequest,
	CheckoutPaymentResponse,
	OrderStatus,
} from "@/types";

export const ORDER_STATUS_LABEL: Record<
	OrderStatus,
	{ label: string; color: string }
> = {
	PENDING: {
		label: "Aguardando pagamento",
		color: "bg-yellow-100 text-yellow-700",
	},
	PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-700" },
	PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
	SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
	DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
	CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export function getOrderStatusInfo(status: string) {
	return (
		ORDER_STATUS_LABEL[status as OrderStatus] ?? {
			label: status,
			color: "bg-gray-100 text-gray-600",
		}
	);
}

export function onlyDigits(value: string) {
	return value.replace(/\D/g, "");
}

export function formatCep(value: string) {
	const digits = onlyDigits(value).slice(0, 8);

	if (digits.length <= 5) {
		return digits;
	}
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isCheckoutAddressValid(address: CheckoutAddress) {
	return (
		onlyDigits(address.delivery_postal_code).length === 8 &&
		address.delivery_street.trim().length > 0 &&
		address.delivery_neighborhood.trim().length > 0 &&
		address.delivery_city.trim().length > 0 &&
		address.delivery_state.trim().length === 2
	);
}

export async function initiateCheckoutPayment(
	payload: CheckoutPaymentRequest
) {
	const response = await api.post<CheckoutPaymentResponse>(
		"/checkout/payment/",
		payload
	);
	return response.data;
}
