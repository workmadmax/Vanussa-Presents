/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 21:43:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 09:58:50 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ProductCard } from "@/components/productCard";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get("products/").then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Vanusa Presentes 💎</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
