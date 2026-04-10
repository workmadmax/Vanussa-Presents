/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   layout.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 17:47:03 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/10 17:30:59 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { CartProvider } from "@/context/cartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Site",
  description: "Next.js app",
};


export default function RootLayout({ children }: any) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
