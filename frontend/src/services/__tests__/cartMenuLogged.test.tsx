/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenuLogged.test.tsx                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 20:00:19 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/24 20:18:19 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartMenuLogged } from "@/components/layouts/supportMenu/cart/cartMenuLogged";

/* ================= HELPERS ================= */

function renderLogged(cartCount = 1, total = 100) {
	const onCheckout = jest.fn();
	const onCartClick = jest.fn();

	render(
		<CartMenuLogged
			cartCount={cartCount}
			total={total}
			onCheckout={onCheckout}
			onCartClick={onCartClick}
		/>,
	);

	return { onCheckout, onCartClick };
}

function getParagraphWithText(...words: string[]) {
	return screen.getByText((_, element) =>
		element?.tagName === "P" &&
		words.every((word) => element?.textContent?.includes(word))
			? true
			: false,
	);
}

/* ================= TESTES ================= */

beforeEach(() => {
	jest.clearAllMocks();
});

describe("CartMenuLogged", () => {
	describe("renderização", () => {
		it("mostra quantidade no singular com 1 item", () => {
			renderLogged(1, 99.99);
			expect(getParagraphWithText("1", "item")).toBeInTheDocument();
		});

		it("mostra quantidade no plural com múltiplos itens", () => {
			renderLogged(3, 299.97);
			expect(getParagraphWithText("3", "itens")).toBeInTheDocument();
		});

		it("mostra o total formatado corretamente", () => {
			renderLogged(1, 199.99);
			expect(getParagraphWithText("199.99")).toBeInTheDocument();
		});

		it("mostra botão de finalizar compra e ver carrinho", () => {
			renderLogged();
			expect(
				screen.getByRole("button", { name: /finalizar compra/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: /ver carrinho/i }),
			).toBeInTheDocument();
		});
	});

	describe("interações", () => {
		it("chama onCheckout ao clicar em Finalizar compra", async () => {
			const user = userEvent.setup();
			const { onCheckout } = renderLogged();
			await user.click(
				screen.getByRole("button", { name: /finalizar compra/i }),
			);
			expect(onCheckout).toHaveBeenCalledTimes(1);
		});

		it("chama onCartClick ao clicar em Ver carrinho", async () => {
			const user = userEvent.setup();
			const { onCartClick } = renderLogged();
			await user.click(screen.getByRole("link", { name: /ver carrinho/i }));
			expect(onCartClick).toHaveBeenCalledTimes(1);
		});
	});
});
