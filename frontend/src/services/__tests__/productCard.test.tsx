/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   productCard.test.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 20:24:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 22:27:25 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/cards/productCard";
import { Product } from "@/types";

const mockProduct: Product = {
  id: 1,
  name: "Produto Teste",
  description: "Descrição do produto teste",
  slug: "produto-teste",
  price: 99.99,
  images: [{ image: "http://localhost/image.jpg" }],
};

const mockProductWithoutImage: Product = {
  id: 2,
  name: "Produto Sem Imagem",
  description: "Descrição do produto sem imagem",
  slug: "produto-sem-imagem",
  price: 49.99,
  images: [],
};

describe("ProductCard", () => {
  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Produto Teste")).toBeInTheDocument();
  });

  it("renders product price correctly", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("R$ 99,99")).toBeInTheDocument();
  });

  it("renderiza imagem quando existe", () => {
    render(<ProductCard product={mockProduct} />);
    const img = screen.getByAltText("Produto Teste");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://localhost/image.jpg");
  });

  it("não renderiza imagem quando não existe", () => {
    render(<ProductCard product={mockProductWithoutImage} />);
    const fallbackImg = screen.getByAltText("Produto Sem Imagem");
    expect(fallbackImg).toBeInTheDocument();
  });

  it("renderiza botão Ver produto", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Ver")).toBeInTheDocument();
  });

  it("link aponta para a página do produto", () => {
    render(<ProductCard product={mockProduct} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/products/produto-teste");
  });
});
