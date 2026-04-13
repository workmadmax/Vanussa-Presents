/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   layout.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 17:47:03 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/13 10:24:24 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CartProvider } from "@/context/cartContext";
import { Header } from "@/components/headers/header";

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
          {children}
          {/* <Footer /> */}
        </CartProvider>
      </body>
    </html>
  );
}
