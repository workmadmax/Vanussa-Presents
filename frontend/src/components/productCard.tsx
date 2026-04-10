/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   productCard.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 09:35:22 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 09:58:59 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

type Product = {
  id: number;
  name: string;
  price: number;
  images: { image: string }[];
};

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.image || "https://via.placeholder.com/150";

  return (
    <div className="border rounded-2xl p-4 shadow hover:shadow-lg transition">
      {image && (
        <img
          src={image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-2xl"
        />
      )}
      <h2 className="text-lg font-semibold mt-4">{product.name}</h2>
      <p className="text-gray-600 mt-2">${product.price}</p>
      <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded-xl hover:bg-pi">
        Comprar
      </button>
    </div>
  );
}
