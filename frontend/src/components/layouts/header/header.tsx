/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   header.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 19:31:31 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 18:20:04 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { Search, User, Heart, ShoppingBag, Phone } from "lucide-react";
import { SupportMenu } from "../supportMenu/supportMenu";
import { useState } from "react";
import { LoginModal } from "@/components/ui/modal/loguinModal";

export function Header() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="bg-black text-white w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-8 h-\[180px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-black text-2xl shadow-md">
            💎
          </div>
          <Link
            href="/"
            className="text-2xl font-serif tracking-wide text-white hover:text-yellow-500 transition"
          >
            Vanusa Presentes
          </Link>
        </div>

        {/* Barra de busca central */}
        <div className="flex-1 flex justify-center px-10">
          <div className="w-full max-w-2xl flex items-center bg-white/95 rounded-full px-6 py-3 shadow-inner">
            <input
              type="text"
              placeholder="O que você procura?"
              className="flex-1 text-gray-800 text-sm outline-none bg-transparent"
            />
            <Search size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Ações direita */}
        <div className="flex items-center gap-10">
          <SupportMenu>
            <div className="flex flex-col items-center text-sm text-gray-300 hover:text-yellow-500 transition">
              <Phone size={22} />
              <span>Contato</span>
            </div>
          </SupportMenu>

          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex flex-col items-center text-sm text-gray-300 hover:text-yellow-500 transition"
          >
            <User size={22} />
            <span>Entrar ou Cadastre</span>
          </button>

          <button className="flex flex-col items-center text-sm text-gray-300 hover:text-yellow-500 transition relative">
            <ShoppingBag size={22} />
            <span>Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}
