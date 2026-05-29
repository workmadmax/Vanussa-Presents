/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   homeClient.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 21:43:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/25 18:18:29 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ProductCard } from "@/components/cards/productCard";
import { LoginModal } from "@/components/ui/modal/loginModal";
import { RegisterModal } from "@/components/ui/modal/registerModal";
import { Product } from "@/types";

type HomeClientProps = {
	category: string | null;
};

type PaginationState = {
	category: string | null;
	page: number;
};

export function HomeClient({ category }: HomeClientProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationState>({
		category,
		page: 1,
	});
	const [totalPages, setTotalPages] = useState(1);
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const currentPage = pagination.category === category ? pagination.page : 1;

	useEffect(() => {
		let isActive = true;
		let url = `/products/?page=${currentPage}`;

		if (category) {
			url += `&category=${category}`;
		}

		queueMicrotask(() => {
			if (isActive) {
				setLoading(true);
			}
		});

		api
			.get(url)
			.then((res) => {
				if (!isActive) {
					return;
				}

				const data = res.data;

				setProducts(Array.isArray(data) ? data : (data.results ?? []));
				setTotalPages(data.total_pages ?? 1);
			})
			.finally(() => {
				if (isActive) {
					setLoading(false);
				}
			});

		return () => {
			isActive = false;
		};
	}, [category, currentPage]);

	function updatePage(nextPage: (page: number) => number) {
		setPagination((prev) => {
			const page = prev.category === category ? prev.page : 1;

			return {
				category,
				page: nextPage(page),
			};
		});
	}

	return (
		<main className="p-6">
			<h1 className="text-3xl font-bold mb-6 text-pink-600">
				Vanusa Presentes 💎
			</h1>

			{category && (
				<p className="mb-4 text-gray-600">
					Filtrando por: <strong>{category}</strong>
				</p>
			)}

			{loading ? (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="h-64 bg-gray-200 rounded-xl animate-pulse"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onLoginClick={() => setIsLoginOpen(true)}
						/>
					))}
				</div>
			)}

			{/* Paginação */}
			{totalPages > 1 && (
				<div className="flex justify-center gap-2 mt-8">
					<button
						onClick={() => updatePage((page) => Math.max(page - 1, 1))}
						disabled={currentPage === 1}
						className="px-4 py-2 rounded-full border disabled:opacity-4
						 hover:bg-pink-100 transition"
					>
						← Anterior
					</button>

					<span className="px-4 py-2 text-gray-600">
						{currentPage} / {totalPages}
					</span>

					<button
						onClick={() => updatePage((page) => Math.min(page + 1, totalPages))}
						disabled={currentPage === totalPages}
						className="px-4 py-2 rounded-full border disabled:opacity-40
						hover:bg-pink-100 transition"
					>
						Próxima →
					</button>
				</div>
			)}

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setIsLoginOpen(false)}
				onOpenRegister={() => setIsRegisterOpen(true)}
			/>
			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
			/>
		</main>
	);
}
