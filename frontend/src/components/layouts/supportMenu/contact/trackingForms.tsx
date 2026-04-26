/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   trackingForms.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:44:39 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 19:06:40 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export function TrackingForm() {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// falta o código de rastreio real, então vamos usar um exemplo genérico
	};

	return (
		<div className="border-t border-[#d4af37]/20 pt-4">
			<p className="text-[#b8860b] font-serif italic mb-3">
				Rastrear seu pedido
			</p>

			<form
				onSubmit={handleSubmit}
				className="flex group shadow-[4px_4px_0px_0px_rgba(212,175,55,0.2)]"
			>
				<input
					type="text"
					placeholder="Código de rastreio"
					className="bg-white border-2 border-[#d4af37] border-r-0 rounded-l-md px-4 py-3 w-full focus:outline-none"
				/>
				<button
					type="submit"
					className="bg-[#d4af37] border-2 border-[#d4af37] hover:bg-[#b8860b] hover:border-[#b8860b] text-white px-5 rounded-r-md transition-colors duration-300"
				>
					→
				</button>
			</form>
		</div>
	);
}
