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

import Image from "next/image";
import { useEffect, useState, use } from "react";
import { api } from "@/services/api";
import { useCart } from "@/context/cartContext";
import { Product, ProductImage } from "@/types";
import { ProductCard } from "@/components/cards/productCard";

export default function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const resolveParams = use(params);
	const slug = resolveParams.slug;

	const { addToCart } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

	useEffect(() => {
		let isActive = true;

		async function loadProduct() {
			setProduct(null);
			setSelectedImage(null);
			setRelatedProducts([]);

			try {
				const productResponse = await api.get<Product>(`/products/${slug}/`);
				if (!isActive) {
					return;
				}

				const nextProduct = productResponse.data;
				setProduct(nextProduct);
				setSelectedImage(nextProduct.images?.[0] ?? null);

				try {
					const relatedResponse = await api.get<Product[]>(
						`/products/${slug}/related/`
					);
					if (isActive) {
						setRelatedProducts(
							Array.isArray(relatedResponse.data) ? relatedResponse.data : []
						);
					}
				} catch (err) {
					console.error("Erro ao buscar produtos relacionados:", err);
					if (isActive) {
						setRelatedProducts([]);
					}
				}
			} catch (err) {
				console.error("Erro ao buscar produto:", err);
				if (isActive) {
					setProduct(null);
				}
			}
		}

		loadProduct();

		return () => {
			isActive = false;
		};
	}, [slug]);

	if (!product) {
		return <p>Carregando...</p>;
	}

	const productImages = product.images ?? [];
	const selectedImageUrl = selectedImage?.image;
	const selectedImageAlt = selectedImage?.alt_text || product.name;

	return (
		<main className="p-6">
			<div className="grid md:grid-cols-2 gap-8">
				<section aria-label={`Galeria de imagens de ${product.name}`}>
					{selectedImageUrl ? (
						<div
							className="relative w-full aspect-square overflow-hidden rounded-xl
							bg-gray-100"
						>
							<Image
								src={selectedImageUrl}
								alt={selectedImageAlt}
								fill
								sizes="(min-width: 768px) 50vw, 100vw"
								className="object-cover"
								data-testid="selected-product-image"
							/>
						</div>
					) : (
						<div
							role="img"
							aria-label={`Imagem indisponível para ${product.name}`}
							className="w-full aspect-square rounded-xl bg-gray-100"
						/>
					)}

					{productImages.length > 1 && (
						<div
							aria-label="Miniaturas do produto"
							className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4"
						>
							{productImages.map((image, index) => {
								const isSelected = selectedImage?.image === image.image;

								return (
									<button
										key={image.id ?? image.image}
										type="button"
										onClick={() => setSelectedImage(image)}
										aria-label={`Ver imagem ${index + 1} de ${product.name}`}
										aria-pressed={isSelected}
										className={`relative aspect-square overflow-hidden rounded-lg
										border transition ${
											isSelected
												? "border-pink-500 ring-2 ring-pink-200"
												: "border-gray-200 hover:border-pink-300"
										}`}
									>
										<Image
											src={image.image}
											alt={image.alt_text || `${product.name} ${index + 1}`}
											fill
											sizes="96px"
											className="object-cover"
										/>
									</button>
								);
							})}
						</div>
					)}
				</section>

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

			{relatedProducts.length > 0 && (
				<section className="mt-12" aria-labelledby="related-products-title">
					<h2
						id="related-products-title"
						className="text-2xl font-bold text-gray-900 mb-6"
					>
						Produtos relacionados
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{relatedProducts.map((relatedProduct) => (
							<ProductCard key={relatedProduct.id} product={relatedProduct} />
						))}
					</div>
				</section>
			)}
		</main>
	);
}
