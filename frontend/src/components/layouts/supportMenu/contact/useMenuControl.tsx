/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useMenuControl.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 16:33:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 21:54:31 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type MenuState = {
	pathname: string;
	isOpen: boolean;
};

export function useMenuControl() {
	const pathname = usePathname();
	const [menuState, setMenuState] = useState<MenuState>({
		pathname,
		isOpen: false,
	});
	const open = menuState.pathname === pathname ? menuState.isOpen : false;

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
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeMenu();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [closeMenu]);

	return { isOpen: open, toggleMenu };
}
