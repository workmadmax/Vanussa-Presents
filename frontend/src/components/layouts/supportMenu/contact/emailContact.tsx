/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   emailContact.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:43:56 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 18:44:15 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export function EmailContact() {
  return (
    <div className="text-sm mb-5 bg-white p-4 rounded-lg border-2 border-[#b8860b]/10">
      <p className="text-[#a0aec0] uppercase tracking-widest text-[10px] font-bold mb-1">
        E-mail Exclusive
      </p>
      <p className="font-medium text-slate-800 wrap-break-word">
        atendimento@vanusapresentes.com
      </p>
    </div>
  );
}
