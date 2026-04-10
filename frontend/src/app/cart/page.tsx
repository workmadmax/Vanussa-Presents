/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:40:14 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 17:47:25 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useCart } from "@/context/cartContext";

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Carrinho 🛒</h1>

      {cartItems.length === 0 && <p>Seu carrinho está vazio</p>}

      {cartItems.map((item) => (
        <div key={item.id} className="border p-4 mb-4 rounded-xl">
          <h2>{item.name}</h2>
          <p>Quantidade: {item.quantity}</p>
          <p>R$ {item.price}</p>

          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 mt-2"
          >
            Remover
          </button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6">
        Total: R$ {total.toFixed(2)}
      </h2>
    </main>
  );
}