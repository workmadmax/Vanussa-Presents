/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useSupportMenu.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:56:31 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/22 15:40:14 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

type MenuState = {
	pathname: string;
	isOpen: boolean;
};

export function useSupportMenu() {
	const pathname = usePathname();
	const [menuState, setMenuState] = useState<MenuState>({
		pathname,
		isOpen: false,
	});
	const isOpen = menuState.pathname === pathname ? menuState.isOpen : false;

	const closeMenu = useCallback(() => {
		setMenuState((prev) => {
			const isCurrentPath = prev.pathname === pathname;

			if (isCurrentPath && !prev.isOpen) {
				return prev;
			}

			return { pathname, isOpen: false };
		});
	}, [pathname]);

	const toggleMenu = () => {
		setMenuState((prev) => {
			const currentOpen = prev.pathname === pathname ? prev.isOpen : false;

			return { pathname, isOpen: !currentOpen };
		});
	};

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
