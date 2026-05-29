/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useSupportMenu.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:56:31 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/28 23:22:53 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export function useSupportMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const pathname = usePathname();

	const closeMenu = useCallback(() => setIsOpen(false), []);
	const toggleMenu = () => setIsOpen((prev) => !prev);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		closeMenu();
	}, [pathname, closeMenu]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeMenu();
			}
		};

		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeMenu]);

	return { isOpen, toggleMenu, closeMenu };
}
