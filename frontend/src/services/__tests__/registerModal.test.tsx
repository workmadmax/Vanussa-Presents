/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   registerModal.test.tsx                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/17 22:37:42 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/17 22:43:15 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// frontend/src/services/__tests__/registerModal.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterModal } from "@/components/ui/modal/registerModal";
import { useAuth } from "@/context/authContext";

/* ================= MOCK ================= */

jest.mock("@/context/authContext");

const mockRegisterUser = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({
    registerUser: mockRegisterUser,
  });
});

/* ================= HELPERS ================= */

function renderModal(isOpen = true) {
  const onClose = jest.fn();
  render(<RegisterModal isOpen={isOpen} onClose={onClose} />);
  return { onClose };
}

/* ================= TESTES ================= */

describe("RegisterModal", () => {
  describe("renderização", () => {
    it("não renderiza quando isOpen é false", () => {
      renderModal(false);
      expect(screen.queryByText("Criar conta")).not.toBeInTheDocument();
    });

    it("renderiza os campos quando isOpen é true", () => {
      renderModal();
      expect(
        screen.getByPlaceholderText("Digite seu usuário"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Digite seu e-mail"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Crie uma senha")).toBeInTheDocument();
      expect(screen.getAllByText("Criar conta").length).toBeGreaterThan(0);
    });
  });

  describe("submit com sucesso", () => {
    it("chama registerUser com os dados corretos", async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderModal();

      fireEvent.change(screen.getByPlaceholderText("Digite seu usuário"), {
        target: { value: "mdouglas" },
      });
      fireEvent.change(screen.getByPlaceholderText("Digite seu e-mail"), {
        target: { value: "mdouglas@42sp.org.br" },
      });
      fireEvent.change(screen.getByPlaceholderText("Crie uma senha"), {
        target: { value: "senha123" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }));

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith(
          "mdouglas",
          "mdouglas@42sp.org.br",
          "senha123",
        );
      });
    });

    it("exibe mensagem de sucesso e limpa os campos", async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderModal();

      fireEvent.change(screen.getByPlaceholderText("Digite seu usuário"), {
        target: { value: "mdouglas" },
      });
      fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Create account successful! 🎉"),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Digite seu usuário")).toHaveValue(
          "",
        );
      });
    });
  });

  describe("submit com erro", () => {
    it("exibe mensagem de erro retornada pela API", async () => {
      mockRegisterUser.mockResolvedValue({
        success: false,
        message: "Este usuário já existe.",
      });
      renderModal();

      fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }));

      await waitFor(() => {
        expect(screen.getByText("Este usuário já existe.")).toBeInTheDocument();
      });
    });

    it("exibe mensagem padrão quando API não retorna message", async () => {
      mockRegisterUser.mockResolvedValue({ success: false });
      renderModal();

      fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Failed to create account. Please try again."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("estado de loading", () => {
    it("desabilita o botão durante o envio", async () => {
      mockRegisterUser.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100),
          ),
      );
      renderModal();

      fireEvent.submit(screen.getByRole("button", { name: /criar conta/i }));

      expect(
        screen.getByRole("button", { name: /loading/i }),
      ).toBeDisabled();
    });
  });

  describe("fechar modal", () => {
    it("chama onClose ao clicar no overlay", () => {
      const { onClose } = renderModal();
      fireEvent.click(document.querySelector(".absolute.inset-0")!);
      expect(onClose).toHaveBeenCalled();
    });

    it("chama onClose ao pressionar Escape", () => {
      const { onClose } = renderModal();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
