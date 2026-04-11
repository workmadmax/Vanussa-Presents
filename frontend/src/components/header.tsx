/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   header.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 19:31:31 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 23:56:05 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { Search, User, Heart, ShoppingBag, Phone } from "lucide-react"; // Instale: npm install lucide-react

export function Header() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-[#FFDEAD] text-white w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold tracking-widest">
            Vanusa Presentes 💎
          </h1>
        </div>
        {/* Barra de busca */}
        <div className="justify-center px-4">
          <div className="w-full max-w-xl items-center bg-white rounded-md flex px-4 py-2 gap-2">
            <input
              type="text"
              placeholder="Olá, o que você procura?"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent"
            />
            <Search size={18} className="text-gray-500" />
          </div>
        </div>
        {/* Ícones direita */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <button className="flex flex-col items-center text-xs text-gray-300 hover:text-white">
            <Phone size={20} />
            <span>Contato</span>
          </button>

          <button className="flex flex-col items-center text-xs text-gray-300 hover:text-white">
            <User size={20} />
            <span>Entrar</span>
          </button>

          <button className="flex flex-col items-center text-xs text-gray-300 hover:text-white relative">
            <ShoppingBag size={20} />
            <span>Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
