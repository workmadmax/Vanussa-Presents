/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useMenuControl.test.tsx                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 20:42:44 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 21:43:08 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { renderHook, act } from "@testing-library/react";

// Mock COMPLETO do next/navigation garantido antes do import do hook
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

import { useMenuControl } from "@/components/layouts/supportMenu/contact/useMenuControl";

describe("useMenuControl", () => {
  it("inicia fechado", () => {
    const { result } = renderHook(() => useMenuControl());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggleMenu abre o menu", () => {
    const { result } = renderHook(() => useMenuControl());
    act(() => result.current.toggleMenu());
    expect(result.current.isOpen).toBe(true);
  });

  it("toggleMenu fecha o menu se já estava aberto", () => {
    const { result } = renderHook(() => useMenuControl());
    act(() => result.current.toggleMenu());
    act(() => result.current.toggleMenu());
    expect(result.current.isOpen).toBe(false);
  });

  it("fecha ao pressionar Escape", () => {
    const { result } = renderHook(() => useMenuControl());
    act(() => result.current.toggleMenu());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(false);
  });
});
