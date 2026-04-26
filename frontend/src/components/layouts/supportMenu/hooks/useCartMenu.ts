/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useCartMenu.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 15:56:04 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 15:58:07 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect, useCallback, use } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useCartMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const pathName = usePathname();
	const searchParams = useSearchParams();

	const closeMenu = useCallback(() => setIsOpen(false), []);
	const toggleMenu = () => setIsOpen((prev) => !prev);

	useEffect(() => {
		closeMenu();
	}, [pathName, closeMenu, searchParams]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeMenu();
			}
		}

		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeMenu]);

	return { isOpen, toggleMenu, closeMenu };
}
