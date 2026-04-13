/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   layout.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 17:47:03 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/13 19:44:40 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CartProvider } from "@/context/cartContext";
import { Header } from "@/components/layouts/header/header";
import { CategoryBar } from "@/components/cards/categoryBar";

import "./globals.css";

export const metadata: Metadata = {
  title: "My Site",
  description: "Next.js app",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <CartProvider>
          <Header />
          <CategoryBar />
          {children}
          {/* <Footer /> */}
        </CartProvider>
      </body>
    </html>
  );
}
