/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartPage.test.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 20:00:56 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/24 20:19:40 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartPage from "@/app/cart/page";
import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

/* ================= MOCKS ================= */

jest.mock("@/context/cartContext");
jest.mock("@/context/authContext");
jest.mock("next/navigation", () => ({
	useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();

const mockItem = {
	id: 1,
	name: "Colar de prata",
	slug: "colar-de-prata",
	price: 499.99,
	quantity: 1,
	images: [{ image: "http://127.0.0.1:8000/media/colar.jpg" }],
};

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

/* ================= HELPERS ================= */

function setup({
	cartItems = [],
	isAuthenticated = false,
}: {
	cartItems?: (typeof mockItem)[];
	isAuthenticated?: boolean;
} = {}) {
	(useCart as jest.Mock).mockReturnValue({
		cartItems,
		removeFromCart: mockRemoveFromCart,
		updateQuantity: mockUpdateQuantity,
		clearCart: mockClearCart,
	});

	(useAuth as jest.Mock).mockReturnValue({ isAuthenticated });

	render(<CartPage />);
}

/* ================= TESTES ================= */

describe("CartPage", () => {
	describe("carrinho vazio", () => {
		it("mostra mensagem de carrinho vazio", () => {
			setup();
			expect(screen.getByText("Seu carrinho está vazio")).toBeInTheDocument();
		});

		it("não mostra botão de limpar carrinho", () => {
			setup();
			expect(
				screen.queryByRole("button", { name: /limpar carrinho/i }),
			).not.toBeInTheDocument();
		});
	});

	describe("carrinho com itens — não logado", () => {
		it("mostra os itens do carrinho", () => {
			setup({ cartItems: [mockItem] });
			expect(screen.getByText("Colar de prata")).toBeInTheDocument();
		});

		it("mostra total corretamente", () => {
			setup({ cartItems: [mockItem] });
			expect(
				screen.getByText(/R\$ 499\.99/, { selector: "span.text-2xl" }),
			).toBeInTheDocument();
		});

		it("mostra botão de Faça login", () => {
			setup({ cartItems: [mockItem] });
			expect(
				screen.getByRole("button", { name: /faça login/i }),
			).toBeInTheDocument();
		});

		it("não mostra botão de Finalizar compra", () => {
			setup({ cartItems: [mockItem] });
			expect(
				screen.queryByRole("button", { name: /finalizar compra/i }),
			).not.toBeInTheDocument();
		});

		it("abre modal de login ao clicar em Faça login", async () => {
			const user = userEvent.setup();
			setup({ cartItems: [mockItem] });
			await user.click(screen.getByRole("button", { name: /faça login/i }));
			await waitFor(() => {
				expect(screen.getByText("Efetuar login")).toBeInTheDocument();
			});
		});

		it("mostra botão limpar carrinho", () => {
			setup({ cartItems: [mockItem] });
			expect(
				screen.getByRole("button", { name: /limpar carrinho/i }),
			).toBeInTheDocument();
		});

		it("chama clearCart ao clicar em Limpar carrinho", async () => {
			const user = userEvent.setup();
			setup({ cartItems: [mockItem] });
			await user.click(
				screen.getByRole("button", { name: /limpar carrinho/i }),
			);
			expect(mockClearCart).toHaveBeenCalledTimes(1);
		});
	});

	describe("carrinho com itens — logado", () => {
		it("mostra botão de Finalizar compra", () => {
			setup({ cartItems: [mockItem], isAuthenticated: true });
			expect(
				screen.getByRole("button", { name: /finalizar compra/i }),
			).toBeInTheDocument();
		});

		it("não mostra botão de Faça login", () => {
			setup({ cartItems: [mockItem], isAuthenticated: true });
			expect(
				screen.queryByRole("button", { name: /faça login/i }),
			).not.toBeInTheDocument();
		});

		it("redireciona para /checkout ao clicar em Finalizar compra", async () => {
			const user = userEvent.setup();
			setup({ cartItems: [mockItem], isAuthenticated: true });
			await user.click(
				screen.getByRole("button", { name: /finalizar compra/i }),
			);
			expect(mockPush).toHaveBeenCalledWith("/checkout");
		});
	});
});
