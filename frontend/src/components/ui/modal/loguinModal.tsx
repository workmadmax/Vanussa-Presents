/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   loguinModal.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 17:47:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/16 20:51:17 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   loguinModal.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 17:47:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 22:30:33 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/authContext";

/* ================= TYPES ================= */

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/* ================= MAIN COMPONENT ================= */

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  useEscapeToClose(isOpen, onClose);

  const { loginUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Overlay onClose={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <ModalHeader onClose={onClose} />

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await loginUser(username, password);
            onClose();
          }}
        >
          <InputField
            label="Usuário (ou E-mail)"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PrimaryButton>Entrar</PrimaryButton>
          <SecondaryButton>Não sei meu e-mail</SecondaryButton>
          <GoogleButton />
          <SignupText />
        </form>
      </div>
    </div>
  );
}

/* ================= HOOK ================= */

function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKey);
    }

    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);
}

/* ================= UI COMPONENTS ================= */

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="absolute inset-0 bg-black/50" onClick={onClose} />;
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Efetuar login</h2>

      <button onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}

/* ================= FORM COMPONENTS ================= */

type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
  );
}

function PasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-gray-600">
        <label>Senha</label>
        <span className="cursor-pointer text-gray-500 hover:text-pink-500 hover:underline">
          Esqueceu sua senha?
        </span>
      </div>

      <input
        type="password"
        placeholder="Digite sua senha"
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
  );
}

/* ================= BUTTONS ================= */

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-xl bg-black py-3 text-white hover:opacity-90">
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-xl border py-3 text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

function GoogleButton() {
  return (
    <button
      type="button"
      className="rounded-xl bg-red-500 py-3 text-white hover:bg-red-600"
    >
      Google
    </button>
  );
}

function SignupText() {
  return (
    <p className="text-center text-sm text-gray-600">
      Novo por aqui?{" "}
      <span className="cursor-pointer underline">Cadastre-se</span>
    </p>
  );
}
