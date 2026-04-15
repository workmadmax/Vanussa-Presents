/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   whatsAppContact.tsx                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:43:24 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 19:06:52 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export function WhatsAppContact() {
  return (
    <>
      <a
        href="https://wa.me/5599999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full border-2 border-[#d4af37] text-[#b8860b] font-bold py-3 rounded-lg mb-3 transition-all duration-200 hover:bg-[#d4af37] hover:text-white"
      >
        <span>💬</span> Fale pelo WhatsApp
      </a>
      <button className="w-full text-[#b8860b] text-sm font-semibold underline underline-offset-4 decoration-[#d4af37]/40 hover:decoration-[#d4af37] transition-all mb-5">
        Enviar uma mensagem
      </button>
    </>
  );
}
