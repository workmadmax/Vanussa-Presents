/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   productCard.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 09:35:22 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 17:06:24 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Link from "next/link";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: { image: string }[];
};

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.image;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="border rounded-2xl p-4 shadow hover:shadow-lg transition cursor-pointer">
        {image && (
          <img
            src={image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-xl mb-3"
          />
        )}

        <h2 className="text-lg font-semibold">{product.name}</h2>

        <p className="text-pink-600 font-bold text-xl mt-2">
          R$ {product.price}
        </p>

        <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pink-600">
          Ver produto
        </button>
      </div>
    </Link>
  );
}