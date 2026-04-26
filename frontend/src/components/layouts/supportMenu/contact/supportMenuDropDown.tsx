/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   supportMenuDropDown.tsx                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:40:40 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 19:06:18 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export function SupportMenuDropdown({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className="
        absolute right-0 mt-5 w-80
        bg-[#f7fafc]
        text-slate-900
        rounded-lg
        border-2 border-[#b8860b]
        shadow-[8px_8px_0px_0px_#b8860b]
        transition-all duration-200 ease-in-out
        hover:translate-x-[px] hover:translate-y-[0.75px]
        hover:shadow-[4px_4px_0px_0px_#b8860b]
        p-6
        animate-in fade-in slide-in-from-top-4
      "
		>
			<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-5 rounded-lg pointer-events-none"></div>

			<div className="relative z-10">{children}</div>
		</div>
	);
}
