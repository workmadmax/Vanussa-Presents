/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useClickOutside.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:54:36 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 18:55:30 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Se o clique foi dentro do elemento referenciado, não faz nada
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // Se foi fora, dispara a função (handler)
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
