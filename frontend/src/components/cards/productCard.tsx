/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   productCard.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 09:35:22 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 17:28:56 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Link from "next/link";
import { Product } from "@/types";

type ProductCardProps = {
  product: Product;
};

function Badge({ label }: { label: string }) {
  return (
    <span className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded">
      {label}
    </span>
  );
}

function Actions({ slug }: { slug: string }) {
  return (
    <div className="flex gap-2 mt-2">
      <Link
        href={`/products/${slug}`}
        className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded-lg transition"
      >
        Ver
      </Link>
      <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-sm py-2 rounded-lg transition">
        Comprar
      </button>
    </div>
  );
}

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.image ?? "/placeholder.png";

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300">
      <Link href={`/products/${product.slug}`}>
        <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <Badge label="Novo" />
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-800 line-clamp-2">
          {product.name}
        </h2>
        <p className="text-lg font-semibold text-pink-600">
          {formatPrice(product.price)}
        </p>
        <Actions slug={product.slug} />
      </div>
    </article>
  );
}
