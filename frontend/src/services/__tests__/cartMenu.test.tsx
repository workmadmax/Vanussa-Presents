/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cartMenu.test.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/26 18:40:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/26 18:40:00 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartMenu } from "@/components/layouts/supportMenu/cart/cartMenu";
import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/cartContext";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";

let mockPathname = "/";

jest.mock("@/context/authContext");
jest.mock("@/context/cartContext");
jest.mock("@/services/api", () => ({
	api: {
		post: jest.fn(),
	},
}));
jest.mock("next/navigation", () => ({
	usePathname: () => mockPathname,
	useRouter: jest.fn(),
}));

const mockApiPost = api.post as jest.Mock;
const mockPush = jest.fn();
const mockOnLoginClick = jest.fn();

const mockItem = {
	id: 1,
	name: "Colar de prata",
	slug: "colar-de-prata",
	description: "Produto teste",
	price: 499.99,
	stock: 5,
	is_active: true,
	created_at: "2026-05-26",
	category: 1,
	images: [],
	quantity: 2,
};

function renderCartMenu() {
	return (
		<CartMenu onLoginClick={mockOnLoginClick}>
			<span>Carrinho</span>
		</CartMenu>
	);
}

function setup(isAuthenticated = true) {
	(useAuth as jest.Mock).mockReturnValue({ isAuthenticated });
	(useCart as jest.Mock).mockReturnValue({ cartItems: [mockItem] });
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	mockApiPost.mockResolvedValue({ data: { id: 123 } });

	return render(renderCartMenu());
}

beforeEach(() => {
	jest.clearAllMocks();
	mockPathname = "/";
});

describe("CartMenu", () => {
	it("creates an order through the central API client and redirects to checkout", async () => {
		const user = userEvent.setup();
		setup(true);

		await user.click(screen.getByText("Carrinho"));
		await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

		await waitFor(() => {
			expect(mockApiPost).toHaveBeenCalledWith("/orders/create/", {
				items: [{ product_id: mockItem.id, quantity: mockItem.quantity }],
			});
			expect(mockPush).toHaveBeenCalledWith("/checkout/123");
		});
	});

	it("opens login flow instead of creating an order for guests", async () => {
		const user = userEvent.setup();
		setup(false);

		await user.click(screen.getByText("Carrinho"));
		await user.click(
			screen.getByRole("button", { name: /entrar ou cadastrar/i })
		);

		expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
		expect(mockApiPost).not.toHaveBeenCalled();
	});

	it("closes the menu when Escape is pressed", async () => {
		const user = userEvent.setup();
		setup(true);

		await user.click(screen.getByRole("button", { name: /carrinho/i }));
		expect(
			screen.getByRole("button", { name: /finalizar compra/i })
		).toBeInTheDocument();

		fireEvent.keyDown(window, { key: "Escape" });

		await waitFor(() => {
			expect(
				screen.queryByRole("button", { name: /finalizar compra/i })
			).not.toBeInTheDocument();
		});
	});

	it("closes the menu when clicking outside", async () => {
		const user = userEvent.setup();
		setup(true);

		await user.click(screen.getByRole("button", { name: /carrinho/i }));
		expect(
			screen.getByRole("button", { name: /finalizar compra/i })
		).toBeInTheDocument();

		fireEvent.mouseDown(document.body);

		await waitFor(() => {
			expect(
				screen.queryByRole("button", { name: /finalizar compra/i })
			).not.toBeInTheDocument();
		});
	});

	it("closes the menu when the route changes", async () => {
		const user = userEvent.setup();
		const { rerender } = setup(true);

		await user.click(screen.getByRole("button", { name: /carrinho/i }));
		expect(
			screen.getByRole("button", { name: /finalizar compra/i })
		).toBeInTheDocument();

		mockPathname = "/cart";
		rerender(renderCartMenu());

		await waitFor(() => {
			expect(
				screen.queryByRole("button", { name: /finalizar compra/i })
			).not.toBeInTheDocument();
		});
	});
});
