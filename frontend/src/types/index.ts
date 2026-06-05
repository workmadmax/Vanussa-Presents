/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/13 20:23:54 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 17:09:36 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/types/index.ts

/**
 * Representa uma imagem de produto vinda da API
 */
export interface ProductImage {
	id?: number;
	image: string;
	alt_text?: string;
}

/**
 * Representa uma categoria de produtos
 */
export interface Category {
	id: number;
	name: string;
	slug: string;
}

/**
 * Representa a estrutura completa de um Produto
 */
export interface Product {
	id: number;
	name: string;
	slug: string;
	price: number;
	description?: string; // Opcional
	images: ProductImage[];
}

/**
 * Tipagem para respostas genéricas da API (opcional, mas recomendado)
 */
export interface ApiResponse<T> {
	data: T;
}

export type OrderStatus =
	| "PENDING"
	| "PROCESSING"
	| "PAID"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED";

export interface OrderItem {
	id?: number;
	product_name: string;
	product_slug: string;
	quantity: number;
	price: string;
	subtotal_price: string;
}

export interface Order {
	id: number;
	status: OrderStatus | string;
	total_price: string;
	payment_id?: string;
	payment_provider_status?: string;
	delivery_street?: string;
	delivery_neighborhood?: string;
	delivery_city?: string;
	delivery_state?: string;
	delivery_postal_code?: string;
	lgpd_consent?: boolean;
	lgpd_consented_at?: string | null;
	created_at: string;
	updated_at: string;
	items: OrderItem[];
}

export type CheckoutAddress = {
	delivery_street: string;
	delivery_neighborhood: string;
	delivery_city: string;
	delivery_state: string;
	delivery_postal_code: string;
};

export type CheckoutPaymentRequest = CheckoutAddress & {
	order_id: number | string;
	lgpd_consent: boolean;
};

export type CheckoutPaymentResponse = {
	init_point: string;
	preference_id: string;
};
