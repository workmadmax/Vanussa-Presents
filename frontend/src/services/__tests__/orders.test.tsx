// frontend/src/__tests__/orders.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/cartContext";
import { api } from "@/services/api";

import CartPage from "@/app/cart/page";
import OrdersPage from "@/app/orders/page";

// ------------------------------------------------------------------ mocks --

jest.mock("next/navigation", () => ({
	useRouter: jest.fn(),
	useParams: jest.fn(() => ({ id: "1" })),
}));

jest.mock("@/context/authContext", () => ({
	useAuth: jest.fn(),
}));

jest.mock("@/context/cartContext", () => ({
	useCart: jest.fn(),
}));

jest.mock("@/services/api", () => ({
	api: {
		post: jest.fn(),
		get: jest.fn(),
	},
}));

// ----------------------------------------------------------------- helpers --

const mockRouter = { push: jest.fn(), back: jest.fn() };

function mockAuth(authenticated = true) {
	(useAuth as jest.Mock).mockReturnValue({
		isAuthenticated: authenticated,
		isLoading: false,
		user: "testuser",
		logout: jest.fn(),
	});
}

function mockCart(
	items = [
		{
			id: 1,
			name: "Pulseira Dourada",
			slug: "pulseira-dourada",
			price: 75.9,
			quantity: 1,
			images: [],
		},
	]
) {
	(useCart as jest.Mock).mockReturnValue({
		cartItems: items,
		totalItems: items.reduce((a, i) => a + i.quantity, 0),
		subtotal: items.reduce((a, i) => a + i.price * i.quantity, 0),
		removeFromCart: jest.fn(),
		updateQuantity: jest.fn(),
		clearCart: jest.fn(),
		addToCart: jest.fn(),
	});
}

const fakeOrder = {
	id: 1,
	status: "PENDING",
	total_price: "75.90",
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	items: [
		{
			id: 1,
			product_name: "Pulseira Dourada",
			product_slug: "pulseira-dourada",
			quantity: 1,
			price: "75.90",
			subtotal_price: "75.90",
		},
	],
};

// =================================================================== TESTES ==

describe("Fluxo de pedido — carrinho", () => {
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		jest.clearAllMocks();
	});

	// teste 1 — linha ~97, substituir o expect do preço
	it("exibe os itens do carrinho", () => {
		mockAuth();
		mockCart();
		render(<CartPage />);
		expect(screen.getByText("Pulseira Dourada")).toBeInTheDocument();
		// R$ 75.90 aparece no item E no total — usar getAllByText
		expect(screen.getAllByText(/R\$ 75\.90/).length).toBeGreaterThanOrEqual(1);
	});

	it("exibe botão 'Finalizar compra' para usuário autenticado com itens", () => {
		mockAuth();
		mockCart();
		render(<CartPage />);
		expect(screen.getByText("Finalizar compra")).toBeInTheDocument();
	});

	it("não exibe botão 'Finalizar compra' para usuário não autenticado", () => {
		mockAuth(false);
		mockCart();
		render(<CartPage />);
		expect(screen.queryByText("Finalizar compra")).not.toBeInTheDocument();
		expect(screen.getByText("Faça login")).toBeInTheDocument();
	});

	it("exibe mensagem de carrinho vazio quando não há itens", () => {
		mockAuth();
		mockCart([]);
		render(<CartPage />);
		expect(screen.getByText("Seu carrinho está vazio")).toBeInTheDocument();
	});

	it("chama POST /orders/create/ com os itens corretos ao finalizar", async () => {
		mockAuth();
		mockCart();
		(api.post as jest.Mock).mockResolvedValueOnce({ data: fakeOrder });

		render(<CartPage />);
		fireEvent.click(screen.getByText("Finalizar compra"));

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith("/orders/create/", {
				items: [{ product_id: 1, quantity: 1 }],
			});
		});
	});

	it("redireciona para /checkout/[id] após pedido criado com sucesso", async () => {
		mockAuth();
		mockCart();
		(api.post as jest.Mock).mockResolvedValueOnce({ data: fakeOrder });

		render(<CartPage />);
		fireEvent.click(screen.getByText("Finalizar compra"));

		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith("/checkout/1");
		});
	});

	it("exibe mensagem de erro quando a API retorna falha", async () => {
		mockAuth();
		mockCart();
		(api.post as jest.Mock).mockRejectedValueOnce({
			response: { data: { detail: "Estoque insuficiente." } },
		});

		render(<CartPage />);
		fireEvent.click(screen.getByText("Finalizar compra"));

		await waitFor(() => {
			expect(screen.getByText("Estoque insuficiente.")).toBeInTheDocument();
		});
	});

	it("exibe 'Processando...' durante a requisição", async () => {
		mockAuth();
		mockCart();
		(api.post as jest.Mock).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ data: fakeOrder }), 500)
				)
		);

		render(<CartPage />);
		fireEvent.click(screen.getByText("Finalizar compra"));

		expect(await screen.findByText("Processando...")).toBeInTheDocument();
	});
});

// ----------------------------------------------------------------- histórico --

describe("Fluxo de pedido — histórico (/orders)", () => {
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		jest.clearAllMocks();
	});

	it("redireciona para / se não autenticado", async () => {
		mockAuth(false);
		(api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
		render(<OrdersPage />);
		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith("/");
		});
	});

	it("exibe mensagem quando não há pedidos", async () => {
		mockAuth();
		(api.get as jest.Mock).mockResolvedValueOnce({ data: [] });
		render(<OrdersPage />);
		await waitFor(() => {
			expect(
				screen.getByText("Você ainda não tem pedidos.")
			).toBeInTheDocument();
		});
	});

	it("lista os pedidos do usuário", async () => {
		mockAuth();
		(api.get as jest.Mock).mockResolvedValue({ data: [fakeOrder] });
		render(<OrdersPage />);

		// verifica que a API foi chamada — o que confirma que auth estava ok
		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/orders/my-orders/");
		});

		// depois verifica o DOM
		await waitFor(
			() => {
				expect(
					screen.queryByText("Você ainda não tem pedidos.")
				).not.toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});

	it("expande os itens do pedido ao clicar", async () => {
		mockAuth();
		(api.get as jest.Mock).mockResolvedValueOnce({ data: [fakeOrder] });
		render(<OrdersPage />);

		await waitFor(() => screen.getByText("Pedido #1"));
		fireEvent.click(screen.getByText("Pedido #1"));

		await waitFor(() => {
			expect(screen.getByText("Pulseira Dourada")).toBeInTheDocument();
		});
	});

	it("chama GET /orders/my-orders/ para buscar histórico", async () => {
		mockAuth();
		(api.get as jest.Mock).mockResolvedValueOnce({ data: [fakeOrder] });
		render(<OrdersPage />);
		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/orders/my-orders/");
		});
	});
});
