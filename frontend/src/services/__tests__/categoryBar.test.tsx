/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   categoryBar.test.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 20:39:22 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 21:12:44 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen, waitFor } from "@testing-library/react";
import { CategoryBar } from "@/components/cards/categoryBar";
import { api } from "@/services/api";

// Mock da resposta da API
jest.mock("@/services/api", () => ({
	api: {
		get: jest.fn(),
	},
}));

jest.mock("next/navigation", () => ({
	usePathname: () => "/",
}));

const mockCategories = [
	{ id: 1, name: "Categoria 1", slug: "categoria-1" },
	{ id: 2, name: "Categoria 2", slug: "categoria-2" },
];

describe("CategoryBar", () => {
	beforeEach(() => {
		(api.get as jest.Mock).mockResolvedValue({ data: mockCategories });
	});

	it("busca categorias ao montar", async () => {
		render(<CategoryBar />);
		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/categories/");
		});
	});

	it("renderiza categorias na lista horizontal", async () => {
		render(<CategoryBar />);
		await waitFor(() => {
			expect(screen.getAllByText("Categoria 1").length).toBeGreaterThan(0);
			expect(screen.getAllByText("Categoria 2").length).toBeGreaterThan(0);
		});
	});

	it("renderiza botão Todas", async () => {
		render(<CategoryBar />);

		await waitFor(() => {
			expect(screen.getByText(/Todas/)).toBeInTheDocument();
		});
	});

	it("links das categorias têm href correto", async () => {
		render(<CategoryBar />);
		await waitFor(() => {
			const links = screen.getAllByRole("link");
			const hrefs = links.map((l) => l.getAttribute("href"));
			expect(hrefs).toContain("/?category=categoria-1");
			expect(hrefs).toContain("/?category=categoria-2");
		});
	});
});
