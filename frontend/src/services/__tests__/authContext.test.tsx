/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authContext.test.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/16 22:13:06 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 22:13:40 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/context/authContext";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
	api: {
		post: jest.fn(),
	},
}));

const mockApiPost = api.post as jest.Mock;

// 1. Criamos um componente de teste para "espiar" o que o AuthContext está fazendo
const TestComponent = () => {
	const { user, isAuthenticated, isLoading, loginUser, registerUser, logout } =
		useAuth();

	return (
		<div>
			<span data-testid="auth-loading">
				{isLoading ? "Carregando" : "Pronto"}
			</span>
			<span data-testid="auth-status">
				{isAuthenticated ? "Logado" : "Deslogado"}
			</span>
			<span data-testid="user-name">{user || "Visitante"}</span>

			<button onClick={() => loginUser("mdouglas", "senha123").catch(() => {})}>
				Fazer Login
			</button>
			<button
				onClick={() =>
					registerUser("newuser", "newuser@test.com", "senha123").catch(
						() => {}
					)
				}
			>
				Fazer Cadastro
			</button>
			<button onClick={logout}>Sair</button>
		</div>
	);
};

describe("AuthContext", () => {
	// Configuração inicial antes de cada teste
	beforeEach(() => {
		// Limpa o localStorage e os mocks de fetch para um teste não interferir no outro
		localStorage.clear();
		jest.clearAllMocks();
	});

	it("deve iniciar carregando e concluir a hidratação deslogado", async () => {
		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		expect(screen.getByTestId("auth-loading")).toHaveTextContent("Carregando");

		await waitFor(() => {
			expect(screen.getByTestId("auth-loading")).toHaveTextContent("Pronto");
		});
		expect(screen.getByTestId("auth-status")).toHaveTextContent("Deslogado");
		expect(screen.getByTestId("user-name")).toHaveTextContent("Visitante");
	});

	it("deve restaurar usuário e token salvos no localStorage após hidratação", async () => {
		localStorage.setItem("token", "token-existente");
		localStorage.setItem("user", "mdouglas");

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		expect(screen.getByTestId("auth-loading")).toHaveTextContent("Carregando");

		await waitFor(() => {
			expect(screen.getByTestId("auth-loading")).toHaveTextContent("Pronto");
		});
		expect(screen.getByTestId("auth-status")).toHaveTextContent("Logado");
		expect(screen.getByTestId("user-name")).toHaveTextContent("mdouglas");
	});

	it("deve fazer login com sucesso e salvar dados no localStorage", async () => {
		// Mockamos a resposta de SUCESSO da API do Django
		mockApiPost.mockResolvedValueOnce({
			data: {
				access: "fake-jwt-token",
				refresh: "fake-refresh-token",
			},
		});

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		// Simulamos o clique no botão de login
		const user = userEvent.setup();
		await user.click(screen.getByText("Fazer Login"));

		// Aguardamos a promessa resolver e o estado atualizar
		await waitFor(() => {
			expect(screen.getByTestId("auth-status")).toHaveTextContent("Logado");
			expect(screen.getByTestId("user-name")).toHaveTextContent("mdouglas");
		});

		// Verificamos se a chamada passou pelo cliente API central
		expect(mockApiPost).toHaveBeenCalledWith("/users/login/", {
			username: "mdouglas",
			password: "senha123",
		});

		// Verificamos se o token foi parar no localStorage
		expect(localStorage.getItem("token")).toBe("fake-jwt-token");
		expect(localStorage.getItem("refresh_token")).toBe("fake-refresh-token");
	});

	it("deve falhar no login com credenciais incorretas", async () => {
		// Mockamos a resposta de ERRO da API (ex: 401 Unauthorized)
		mockApiPost.mockRejectedValueOnce({
			response: {
				data: {
				detail: "Nenhuma conta ativa encontrada com essas credenciais.",
				},
			},
		});

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		const user = userEvent.setup();
		await user.click(screen.getByText("Fazer Login"));

		// O status deve continuar deslogado
		await waitFor(() => {
			expect(screen.getByTestId("auth-status")).toHaveTextContent("Deslogado");
		});

		// E o localStorage não deve ter recebido token
		expect(localStorage.getItem("token")).toBeNull();
	});

	it("deve cadastrar usando o cliente API central", async () => {
		mockApiPost.mockResolvedValueOnce({ data: {} });

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		const user = userEvent.setup();
		await user.click(screen.getByText("Fazer Cadastro"));

		await waitFor(() => {
			expect(mockApiPost).toHaveBeenCalledWith("/users/register/", {
				username: "newuser",
				email: "newuser@test.com",
				password: "senha123",
			});
		});
	});

	it("deve limpar o estado e o localStorage ao fazer logout", async () => {
		// Forçamos um estado inicial logado injetando o token no localStorage
		localStorage.setItem("token", "token-existente");

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		const user = userEvent.setup();

		// Clica no botão de logout do nosso Dummy Component
		await user.click(screen.getByText("Sair"));

		// Verifica se limpou tudo
		await waitFor(() => {
			expect(screen.getByTestId("auth-status")).toHaveTextContent("Deslogado");
		});
		expect(localStorage.getItem("token")).toBeNull();
	});
});
