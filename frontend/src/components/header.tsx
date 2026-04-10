/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hearder.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 19:31:31 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 20:28:53 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { Search, User, Heart, ShoppingBag } from "lucide-react"; // Instale: npm install lucide-react

export function Header() {
  const { cartItems } = useCart();

  // Calcula o total de itens no carrinho
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="w-full font-sans">
      {/* 1. FAIXA SUPERIOR (Promoção) */}
      <div className="w-full bg-pink-500 text-white text-center text-xs py-2 border-b border-pink-300">
        Frete grátis para compras acima de R$ 279
      </div>

      {/* 2. MIOLO (Logo, Busca e Ações) */}
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-serif italic font-light tracking-tighter"
        >
          Vanusa <span className="text-pink-500 font-bold">Presentes</span>
        </Link>

        {/* Barra de Busca */}
        <div className="hidden md:flex flex-1 mx-10 max-w-md relative">
          <input
            type="text"
            placeholder="Busque por aliança, pulseira..."
            className="w-full border-b border-gray-300 pb-1 outline-none focus:border-black transition-colors text-sm"
          />
          <Search className="absolute right-0 bottom-1 w-4 h-4 text-gray-500" />
        </div>

        {/* Ícones de Ação */}
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <Link
            href="/conta"
            className="flex items-center gap-2 hover:text-black"
          >
            <User className="w-5 h-5" />
            <span className="hidden lg:inline">Minha conta</span>
          </Link>

          <Link
            href="/favoritos"
            className="flex items-center gap-2 hover:text-black"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden lg:inline">Lista de desejos</span>
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 hover:text-black font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>sacola de compras ({cartCount})</span>
          </Link>
        </div>
      </div>

      {/* 3. MENU DE CATEGORIAS */}
      <nav className="border-t border-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-4 text-[12px] font-bold uppercase tracking-wider text-gray-800">
            <li className="hover:text-pink-500 cursor-pointer">Alianças</li>
            <li className="hover:text-pink-500 cursor-pointer">Anéis</li>
            <li className="hover:text-pink-500 cursor-pointer text-pink-600">
              Brincos
            </li>
            <li className="hover:text-pink-500 cursor-pointer">Correntes</li>
            <li className="hover:text-pink-500 cursor-pointer font-black border-2 border-black px-3 py-1 bg-black text-white">
              Ver Tudo
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
