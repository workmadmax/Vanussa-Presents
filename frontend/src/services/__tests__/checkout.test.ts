import {
	formatCep,
	getOrderStatusInfo,
	initiateCheckoutPayment,
	isCheckoutAddressValid,
	onlyDigits,
} from "@/services/checkout";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
	api: {
		post: jest.fn(),
	},
}));

describe("checkout service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("formats and validates CEP values", () => {
		expect(onlyDigits("01001-000")).toBe("01001000");
		expect(formatCep("01001000")).toBe("01001-000");
		expect(formatCep("01001")).toBe("01001");
	});

	it("validates required checkout address fields", () => {
		expect(
			isCheckoutAddressValid({
				delivery_street: "Rua Teste",
				delivery_neighborhood: "Centro",
				delivery_city: "Sao Paulo",
				delivery_state: "SP",
				delivery_postal_code: "01001-000",
			})
		).toBe(true);

		expect(
			isCheckoutAddressValid({
				delivery_street: "Rua Teste",
				delivery_neighborhood: "",
				delivery_city: "Sao Paulo",
				delivery_state: "SP",
				delivery_postal_code: "01001-000",
			})
		).toBe(false);
	});

	it("starts checkout payment through the API client", async () => {
		(api.post as jest.Mock).mockResolvedValueOnce({
			data: {
				init_point: "https://mercadopago.test/checkout/1",
				preference_id: "pref-1",
			},
		});

		const response = await initiateCheckoutPayment({
			order_id: 1,
			delivery_street: "Rua Teste",
			delivery_neighborhood: "Centro",
			delivery_city: "Sao Paulo",
			delivery_state: "SP",
			delivery_postal_code: "01001-000",
			lgpd_consent: true,
		});

		expect(api.post).toHaveBeenCalledWith("/checkout/payment/", {
			order_id: 1,
			delivery_street: "Rua Teste",
			delivery_neighborhood: "Centro",
			delivery_city: "Sao Paulo",
			delivery_state: "SP",
			delivery_postal_code: "01001-000",
			lgpd_consent: true,
		});
		expect(response.init_point).toBe("https://mercadopago.test/checkout/1");
	});

	it("maps processing orders to the customer label", () => {
		expect(getOrderStatusInfo("PROCESSING").label).toBe("Processando");
	});
});
