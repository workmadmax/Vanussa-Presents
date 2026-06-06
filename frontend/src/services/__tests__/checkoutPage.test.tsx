import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/checkout/[id]/page";
import { useAuth } from "@/context/authContext";
import { api } from "@/services/api";

jest.mock("next/navigation", () => ({
	useRouter: jest.fn(() => ({ push: jest.fn() })),
	useParams: jest.fn(() => ({ id: "123" })),
}));

jest.mock("@/context/authContext", () => ({
	useAuth: jest.fn(),
}));

jest.mock("@/services/api", () => ({
	api: {
		get: jest.fn(),
		post: jest.fn(),
	},
}));

const checkoutOrder = {
	id: 123,
	status: "PENDING",
	total_price: "75.90",
	created_at: "2026-06-01T10:00:00Z",
	updated_at: "2026-06-01T10:00:00Z",
	delivery_street: "Rua Teste",
	delivery_neighborhood: "Centro",
	delivery_city: "Sao Paulo",
	delivery_state: "SP",
	delivery_postal_code: "01001-000",
	lgpd_consent: false,
	items: [
		{
			product_name: "Pulseira Dourada",
			product_slug: "pulseira-dourada",
			quantity: 1,
			price: "75.90",
			subtotal_price: "75.90",
		},
	],
};

function renderCheckoutPage() {
	render(<CheckoutPage />);
}

describe("checkout page", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useAuth as jest.Mock).mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		(api.get as jest.Mock).mockResolvedValue({ data: checkoutOrder });
		(api.post as jest.Mock).mockRejectedValue({
			response: { data: { detail: "Pagamento indisponivel." } },
		});
	});

	it("requires LGPD consent before initiating payment", async () => {
		renderCheckoutPage();

		const button = await screen.findByRole("button", {
			name: "Ir para pagamento",
		});
		expect(button).toBeDisabled();

		fireEvent.click(screen.getByRole("checkbox"));
		expect(button).toBeEnabled();
		fireEvent.click(button);

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith("/checkout/payment/", {
				order_id: 123,
				delivery_street: "Rua Teste",
				delivery_neighborhood: "Centro",
				delivery_city: "Sao Paulo",
				delivery_state: "SP",
				delivery_postal_code: "01001-000",
				lgpd_consent: true,
			});
		});
	});
});
