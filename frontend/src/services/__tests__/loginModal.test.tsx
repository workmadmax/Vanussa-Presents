/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   loguinModal.test.tsx                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/16 22:38:42 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 22:51:34 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginModal } from "@/components/ui/modal/loginModal"; 
// 1. Importe o useAuth normalmente
import { useAuth } from "@/context/authContext";

// 2. Avise o Jest para mockar o arquivo inteiro
jest.mock("@/context/authContext");

describe("LoginModal Component", () => {
  // Criamos "espiões" (funções falsas) para monitorar as ações
  const mockLoginUser = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Forçamos o useAuth a retornar nosso mock do loginUser e dizer que o usuário está deslogado
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loginUser: mockLoginUser,
      logout: jest.fn(),
    });
  });

  it("deve renderizar os campos de usuário, senha e botão de entrar", () => {
    // Renderezia o modal (assumindo que ele recebe isOpen como prop, ajuste se necessário)
    render(<LoginModal isOpen={true} onClose={mockOnClose} />);

    // Verifica se os campos existem na tela baseados no placeholder ou label
    expect(screen.getByPlaceholderText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve chamar a função de login com os dados digitados ao enviar o formulário", async () => {
    mockLoginUser.mockResolvedValueOnce({ success: true });; // Simula uma resposta de sucesso

    render(<LoginModal isOpen={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    // Simula o usuário digitando nos campos
    await user.type(screen.getByPlaceholderText(/usuário/i), "mdouglas");
    await user.type(screen.getByPlaceholderText(/senha/i), "senha123");

    // Simula o clique no botão
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Verifica se o AuthContext foi chamado exatamente com o que foi digitado
    expect(mockLoginUser).toHaveBeenCalledTimes(1);
    expect(mockLoginUser).toHaveBeenCalledWith("mdouglas", "senha123");
  });

  it("deve exibir mensagem de erro se a API recusar o login", async () => {
    // Simula o authContext lançando um erro (ex: credenciais erradas)
    const erroMensagem =
      "Nenhuma conta ativa encontrada com essas credenciais.";
    mockLoginUser.mockResolvedValueOnce({ success: false, message: erroMensagem });

    render(<LoginModal isOpen={true} onClose={mockOnClose} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/usuário/i), "errado");
    await user.type(screen.getByPlaceholderText(/senha/i), "errado");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Aguarda a tela atualizar e verifica se o erro apareceu
    await waitFor(() => {
      expect(screen.getByText(erroMensagem)).toBeInTheDocument();
    });
  });
});
