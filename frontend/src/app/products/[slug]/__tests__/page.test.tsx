/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.test.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/27 23:59:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/05/27 23:59:00 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen, waitFor } from "@testing-library/react";
import ProductPage from "../page";
import { useCart } from "@/context/cartContext";
import { api } from "@/services/api";
import { Product } from "@/types";

jest.mock("react", () => {
	const actualReact = jest.requireActual("react");

	return {
		...actualReact,
		use(value: unknown) {
			if (typeof value === "object" && value !== null && "then" in value) {
				return { slug: "produto-sem-imagem" };
			}

			return value;
		},
	};
});
jest.mock("@/context/cartContext");
jest.mock("@/services/api", () => ({
	api: {
		get: jest.fn(),
	},
}));

const productWithoutImage: Product = {
	id: 7,
	name: "Produto Sem Imagem",
	slug: "produto-sem-imagem",
	description: "Produto sem imagem cadastrada",
	price: 49.9,
	images: [],
};

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;

function renderProductPage(slug = productWithoutImage.slug) {
	render(<ProductPage params={Promise.resolve({ slug })} />);
}

beforeEach(() => {
	jest.clearAllMocks();
	mockUseCart.mockReturnValue({
		cartItems: [],
		totalItems: 0,
		subtotal: 0,
		addToCart: jest.fn(),
		removeFromCart: jest.fn(),
		updateQuantity: jest.fn(),
		clearCart: jest.fn(),
	});
	mockApiGet.mockResolvedValue({
		data: productWithoutImage,
	} as Awaited<ReturnType<typeof api.get>>);
});

describe("ProductPage", () => {
	it("renders the no-image placeholder when the product detail has no images", async () => {
		renderProductPage();

		await waitFor(() =>
			expect(mockApiGet).toHaveBeenCalledWith(
				"/products/produto-sem-imagem/"
			)
		);

		expect(
			await screen.findByRole("img", {
				name: /imagem indispon.vel para produto sem imagem/i,
			})
		).toBeInTheDocument();
		expect(screen.getByText("Produto Sem Imagem")).toBeInTheDocument();
		expect(screen.queryByAltText("Produto Sem Imagem")).not.toBeInTheDocument();
	});
});
