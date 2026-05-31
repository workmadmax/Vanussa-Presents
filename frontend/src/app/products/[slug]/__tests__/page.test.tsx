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
import userEvent from "@testing-library/user-event";
import ProductPage from "../page";
import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/cartContext";
import { api } from "@/services/api";
import { Product } from "@/types";
import { useRouter } from "next/navigation";

let mockRouteSlug = "produto-sem-imagem";

jest.mock("react", () => {
	const actualReact = jest.requireActual("react");

	return {
		...actualReact,
		use(value: unknown) {
			if (typeof value === "object" && value !== null && "then" in value) {
				return { slug: mockRouteSlug };
			}

			return value;
		},
	};
});
jest.mock("@/context/authContext");
jest.mock("@/context/cartContext");
jest.mock("@/services/api", () => ({
	api: {
		get: jest.fn(),
	},
}));
jest.mock("next/navigation", () => ({
	useRouter: jest.fn(),
}));

const productWithoutImage: Product = {
	id: 7,
	name: "Produto Sem Imagem",
	slug: "produto-sem-imagem",
	description: "Produto sem imagem cadastrada",
	price: 49.9,
	images: [],
};

const productWithGallery: Product = {
	id: 8,
	name: "Produto Com Galeria",
	slug: "produto-com-galeria",
	description: "Produto com duas imagens cadastradas",
	price: 89.9,
	images: [
		{
			id: 1,
			image: "http://localhost/frente.jpg",
			alt_text: "Foto frontal",
		},
		{
			id: 2,
			image: "http://localhost/lateral.jpg",
			alt_text: "Foto lateral",
		},
	],
};

const relatedProduct: Product = {
	id: 9,
	name: "Produto Relacionado",
	slug: "produto-relacionado",
	description: "Produto sugerido pela mesma categoria",
	price: 39.9,
	images: [
		{
			id: 3,
			image: "http://localhost/relacionado.jpg",
			alt_text: "Produto relacionado",
		},
	],
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;
const mockUseRouter = useRouter as jest.Mock;

function makeApiResponse(data: Product | Product[]) {
	return Promise.resolve({
		data,
	} as Awaited<ReturnType<typeof api.get>>);
}

function mockProductApi(product: Product, related: Product[] = []) {
	mockApiGet.mockImplementation((url) => {
		if (url === `/products/${product.slug}/`) {
			return makeApiResponse(product);
		}

		if (url === `/products/${product.slug}/related/`) {
			return makeApiResponse(related);
		}

		return Promise.reject(new Error(`Unexpected URL: ${url}`));
	});
}

function renderProductPage(slug = productWithoutImage.slug) {
	mockRouteSlug = slug;
	render(<ProductPage params={Promise.resolve({ slug })} />);
}

beforeEach(() => {
	jest.clearAllMocks();
	mockUseRouter.mockReturnValue({ push: jest.fn() });
	mockUseAuth.mockReturnValue({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: false,
		registerUser: jest.fn(),
		loginUser: jest.fn(),
		logout: jest.fn(),
	});
	mockUseCart.mockReturnValue({
		cartItems: [],
		totalItems: 0,
		subtotal: 0,
		addToCart: jest.fn(),
		removeFromCart: jest.fn(),
		updateQuantity: jest.fn(),
		clearCart: jest.fn(),
	});
	mockProductApi(productWithoutImage);
});

describe("ProductPage", () => {
	it("renders the no-image placeholder when the product detail has no images", async () => {
		renderProductPage();

		await waitFor(() =>
			expect(mockApiGet).toHaveBeenCalledWith(
					"/products/produto-sem-imagem/"
				)
			);

			await waitFor(() =>
				expect(mockApiGet).toHaveBeenCalledWith(
					"/products/produto-sem-imagem/related/"
				)
			);
			expect(
				await screen.findByRole("img", {
					name: /imagem indispon.vel para produto sem imagem/i,
				})
			).toBeInTheDocument();
			expect(screen.getByText("Produto Sem Imagem")).toBeInTheDocument();
			expect(screen.queryByAltText("Produto Sem Imagem")).not.toBeInTheDocument();
			expect(
				screen.queryByRole("heading", { name: /produtos relacionados/i })
			).not.toBeInTheDocument();
		});

	it("renders product thumbnails and changes the selected gallery image", async () => {
		const user = userEvent.setup();
		mockProductApi(productWithGallery);

		renderProductPage(productWithGallery.slug);

		expect(await screen.findByText("Produto Com Galeria")).toBeInTheDocument();
		expect(screen.getByTestId("selected-product-image")).toHaveAttribute(
			"src",
			"http://localhost/frente.jpg"
		);

		const secondImageButton = screen.getByRole("button", {
			name: /ver imagem 2 de produto com galeria/i,
		});
		await user.click(secondImageButton);

		expect(screen.getByTestId("selected-product-image")).toHaveAttribute(
			"src",
			"http://localhost/lateral.jpg"
		);
		expect(secondImageButton).toHaveAttribute("aria-pressed", "true");
	});

	it("fetches and renders related products in the product page", async () => {
		mockProductApi(productWithGallery, [relatedProduct]);

		renderProductPage(productWithGallery.slug);

		expect(
			await screen.findByRole("heading", { name: /produtos relacionados/i })
		).toBeInTheDocument();
		expect(screen.getByText("Produto Relacionado")).toBeInTheDocument();
		expect(mockApiGet).toHaveBeenCalledWith(
			"/products/produto-com-galeria/related/"
		);
	});

	it("keeps the product detail visible when related products fail to load", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		mockApiGet.mockImplementation((url) => {
			if (url === `/products/${productWithGallery.slug}/`) {
				return makeApiResponse(productWithGallery);
			}

			return Promise.reject(new Error("Related request failed"));
		});

		renderProductPage(productWithGallery.slug);

		expect(await screen.findByText("Produto Com Galeria")).toBeInTheDocument();
		await waitFor(() =>
			expect(mockApiGet).toHaveBeenCalledWith(
				"/products/produto-com-galeria/related/"
			)
		);
		expect(
			screen.queryByRole("heading", { name: /produtos relacionados/i })
		).not.toBeInTheDocument();

		errorSpy.mockRestore();
	});
});
