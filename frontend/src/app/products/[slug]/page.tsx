/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 15:48:07 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 17:39:22 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/services/api";
import { useCart } from "@/context/cartContext";

export default function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const resolveParams = use(params);
	const slug = resolveParams.slug;

	const { addToCart } = useCart();
	const [product, setProduct] = useState<any>(null);

	useEffect(() => {
		api
			.get(`/products/${slug}/`)
			.then((res) => {
				setProduct(res.data);
			})
			.catch((err) => {
				console.error("Erro ao buscar produto:", err);
			});
	}, [slug]);

	if (!product) {
		return <p>Carregando...</p>;
	}

	return (
		<main className="p-6">
			<div className="grid md:grid-cols-2 gap-8">
				{/* Imagem */}
				<img
					src={product.images?.[0]?.image}
					alt={product.name}
					className="w-full rounded-xl"
				/>

				{/* Info */}
				<div>
					<h1 className="text-3xl font-bold">{product.name}</h1>

					<p className="text-2xl text-pink-600 font-bold mt-4">
						R$ {product.price}
					</p>

					<p className="mt-4 text-gray-600">{product.description}</p>

					<button
						onClick={() => addToCart(product)}
						className="mt-6 bg-pink-500 text-white px-6 py-3 rounded-xl"
					>
						Adicionar ao carrinho
					</button>
				</div>
			</div>
		</main>
	);
}
