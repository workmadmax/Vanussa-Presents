/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   header.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/16 20:31:47 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:11:14 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { Search, User, ShoppingBag, Phone, LogOut } from "lucide-react";
import { SupportMenu } from "../supportMenu/supportMenu";
import { useEffect, useState } from "react";
import { LoginModal } from "@/components/ui/modal/loginModal";
import { useAuth } from "@/context/authContext";
import { RegisterModal } from "@/components/ui/modal/registerModal";
import { CartMenu } from "@/components/layouts/supportMenu/cart/cartMenu";

export function Header() {
	const { cartItems } = useCart();
	const { user, isAuthenticated, logout } = useAuth();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

	return (
		<header className="bg-black text-white w-full shadow-lg">
			<div className="max-w-7xl mx-auto px-8 h-\[180px] flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-4">
					<div
						className="w-14 h-14 bg-linear-to-br from-yellow-500
					to-yellow-700 rounded-full flex items-center justify-center
					 text-black text-2xl shadow-md"
					>
						💎
					</div>
					<Link
						href="/"
						className="text-2xl font-serif tracking-wide text-white
						 hover:text-yellow-500 transition"
					>
						Vanusa Presentes
					</Link>
				</div>

				{/* Barra de busca */}
				<div className="flex-1 flex justify-center px-10">
					<div
						className="w-full max-w-2xl flex items-center
						bg-white/95 rounded-full px-6 py-3 shadow-inner"
					>
						<input
							type="text"
							placeholder="O que você procura?"
							className="flex-1 text-gray-800 text-sm outline-none bg-transparent"
						/>
						<Search size={20} className="text-gray-600" />
					</div>
				</div>

				{/* Ações */}
				<div className="flex items-center gap-10">
					<SupportMenu>
						<div
							className="flex flex-col items-center text-sm text-gray-300
						hover:text-yellow-500 transition cursor-pointer"
						>
							<Phone size={22} />
							<span>Contato</span>
						</div>
					</SupportMenu>

					{/* Usuário Logado vs Visitante */}
					{isAuthenticated ? (
						<div className="flex items-center gap-4 border-l border-gray-800 pl-6">
							<div className="flex flex-col items-end">
								<span className="text-xs text-gray-500 uppercase font-bold tracking-widest">
									Bem-vindo
								</span>
								<span className="text-sm font-medium text-pink-400">
									@{user}
								</span>
							</div>
							<button
								onClick={logout}
								className="p-2 hover:bg-gray-900 rounded-full text-gray-400
							hover:text-red-500 transition"
								title="Sair"
							>
								<LogOut size={20} />
							</button>
						</div>
					) : (
						<button
							onClick={() => setIsLoginOpen(true)}
							className="flex flex-col items-center text-sm text-gray-300
								hover:text-yellow-500 transition"
						>
							<User size={22} />
							<span>Entrar ou Cadastre</span>
						</button>
					)}

					{/* Carrinho */}
					<CartMenu onLoginClick={() => setIsLoginOpen(true)}>
						<div
							className="flex flex-col items-center text-sm text-gray-300
						hover:text-yellow-500 transition relative"
						>
							<ShoppingBag size={22} />
							<span>Carrinho</span>
							{mounted && cartCount > 0 && (
								<span
									className="absolute -top-2 -right-3 bg-yellow-50
								 text-black text-xs rounded-full w-5 h-5
								 flex items-center justify-center font-bold animate-pulse"
								>
									{cartCount}
								</span>
							)}
						</div>
					</CartMenu>
				</div>
			</div>
			{/* Modais de Login e Registro */}
			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setIsLoginOpen(false)}
				onOpenRegister={() => setIsRegisterOpen(true)}
			/>
			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
			/>
		</header>
	);
}
