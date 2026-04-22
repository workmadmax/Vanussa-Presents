/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 21:43:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:40:36 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/cards/productCard";
import { LoginModal } from "@/components/ui/modal/loginModal";
import { RegisterModal } from "@/components/ui/modal/registerModal";

export default function Home() {
	const [products, setProducts] = useState<any[]>([]);
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

	const searchParams = useSearchParams();
	const category = searchParams.get("category");

	useEffect(() => {
		let url = "/products/";
		if (category) url += `?category=${category}`;
		api.get(url).then((res) => setProducts(res.data));
	}, [category]);

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

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{products.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						onLoginClick={() => setIsLoginOpen(true)}
					/>
				))}
			</div>

			{/* Modais — fora do grid, dentro do main */}
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
