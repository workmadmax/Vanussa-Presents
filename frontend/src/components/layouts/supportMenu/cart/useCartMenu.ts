/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenu.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/22 16:03:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 16:39:11 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useCartMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const pathname = usePathname();
	const searchParams = useSearchParams();

	const closeMenu = useCallback(() => setIsOpen(false), []);
	const toggleMenu = () => setIsOpen((prev) => !prev);

	useEffect(() => {
		closeMenu();
	}, [pathname, closeMenu, searchParams]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") closeMenu();
		}

		if (isOpen) window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeMenu]);

	return { isOpen, toggleMenu, closeMenu };
}
