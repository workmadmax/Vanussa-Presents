/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 21:43:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/13 13:23:10 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ProductCard } from "@/components/cards/productCard";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const searchParams = useSearchParams();

  const category = searchParams.get("Category");

  useEffect(() => {
    let url = "/products/";

    if (category) {
      url += `?Category=${category}`;
    }

    api.get(url).then((res) => {
      setProducts(res.data);
    });
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
