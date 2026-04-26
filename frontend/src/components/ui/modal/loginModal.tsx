/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   loginModal.tsx                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 17:47:00 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/17 22:15:55 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import {
	useEscapeToClose,
	Overlay,
	ModalHeader,
	InputField,
	FeedbackMessage,
	PrimaryButton,
	SecondaryButton,
	GoogleButton,
} from "./modalComponents";

/* ================= TYPES ================= */

type LoginModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onOpenRegister: () => void;
};

/* ================= MAIN COMPONENT ================= */

export function LoginModal({
	isOpen,
	onClose,
	onOpenRegister,
}: LoginModalProps) {
	useEscapeToClose(isOpen, onClose);

	const { loginUser } = useAuth();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	if (!isOpen) {
		return null;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const result = await loginUser(username, password);

		if (!result.success) {
			setError(result.message || "Erro desconhecido");
		} else {
			onClose();
		}

		setLoading(false);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<Overlay onClose={onClose} />

			<div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<ModalHeader title="Efetuar login" onClose={onClose} />

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

					{error && <FeedbackMessage type="error" message={error} />}

					<PrimaryButton loading={loading}>Entrar</PrimaryButton>
					<SecondaryButton>Não sei meu e-mail</SecondaryButton>
					<GoogleButton />
					<SignupText onClose={onClose} onOpenRegister={onOpenRegister} />
				</form>
			</div>
		</div>
	);
}

/* ================= LOCAL COMPONENTS ================= */

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

function SignupText({
	onClose,
	onOpenRegister,
}: {
	onClose: () => void;
	onOpenRegister: () => void;
}) {
	return (
		<span
			className="cursor-pointer underline text-center text-sm text-gray-600"
			onClick={() => {
				onClose();
				onOpenRegister();
			}}
		>
			Não tem conta? Cadastre-se
		</span>
	);
}
