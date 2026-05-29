/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useMenuControl.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 16:33:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/28 23:22:49 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useMenuControl() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const toggleMenu = () => setOpen((prev) => !prev);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return { isOpen: open, toggleMenu };
}
