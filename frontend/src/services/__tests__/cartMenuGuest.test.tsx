/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenuGuest.test.tsx                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 19:59:02 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/24 20:16:24 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartMenuGuest } from "@/components/layouts/supportMenu/cart/cartMenuGuest";

/* ================= HELPERS ================= */

function renderGuest(cartCount = 0) {
	const onLoginClick = jest.fn();
	const onCartClick = jest.fn();

	render(
		<CartMenuGuest
			cartCount={cartCount}
			onLoginClick={onLoginClick}
			onCartClick={onCartClick}
		/>,
	);

	return { onLoginClick, onCartClick };
}

/* ================= TESTES ================= */

describe("CartMenuGuest", () => {
	describe("renderização", () => {
		it("mostra quantidade no singular quando há apenas 1 item", () => {
			renderGuest(1);
			const paragraph = screen.getByText((_, element) =>
				element?.tagName === "P" &&
				element?.textContent?.includes("1") &&
				element?.textContent?.includes("item") &&
				element?.textContent?.includes("carrinho")
					? true
					: false,
			);
			expect(paragraph).toBeInTheDocument();
		});

		it("mostra quantidade no plural quando há múltiplos itens", () => {
			renderGuest(3);
			const paragraph = screen.getByText((_, element) =>
				element?.tagName === "P" &&
				element?.textContent?.includes("3") &&
				element?.textContent?.includes("itens") &&
				element?.textContent?.includes("carrinho")
					? true
					: false,
			);
			expect(paragraph).toBeInTheDocument();
		});

		it("renderiza os botões de login e carrinho corretamente", () => {
			renderGuest();
			expect(
				screen.getByRole("button", { name: /entrar ou cadastrar/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /ver carrinho/i }),
			).toBeInTheDocument();
		});
	});

	describe("interações", () => {
		it("deve chamar onLoginClick ao clicar no botão de Entrar ou Cadastrar", async () => {
			const user = userEvent.setup();
			const { onLoginClick } = renderGuest();
			const loginButton = screen.getByRole("button", {
				name: /entrar ou cadastrar/i,
			});
			await user.click(loginButton); // userEvent é assíncrono
			expect(onLoginClick).toHaveBeenCalledTimes(1);
		});

		it("deve chamar onCartClick ao clicar no botão de Ver carrinho", async () => {
			const user = userEvent.setup();
			const { onCartClick } = renderGuest();
			const cartButton = screen.getByRole("button", { name: /ver carrinho/i });
			await user.click(cartButton);
			expect(onCartClick).toHaveBeenCalledTimes(1);
		});
	});
});
