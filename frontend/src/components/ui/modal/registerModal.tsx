/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   registerModal.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/17 21:26:57 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/17 22:28:00 by mdouglas         ###   ########.fr       */
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
} from "./modalComponents";

type RegisterModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
	useEscapeToClose(isOpen, onClose);

	const { registerUser } = useAuth();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	if (!isOpen) {
		return null;
	}

	async function handleSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);

		const result = await registerUser(username, email, password);

		if (!result.success) {
			setError(result.message || "Failed to create account. Please try again.");
		} else {
			setSuccess("Create account successful! 🎉");
			setUsername("");
			setEmail("");
			setPassword("");
		}

		setLoading(false);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<Overlay onClose={onClose} />

			<div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<ModalHeader title="Criar conta" onClose={onClose} />

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<InputField
						label="Usuário"
						placeholder="Digite seu usuário"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>

					<InputField
						label="E-mail"
						placeholder="Digite seu e-mail"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<InputField
						label="Senha"
						placeholder="Crie uma senha"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{error && <FeedbackMessage type="error" message={error} />}
					{success && <FeedbackMessage type="success" message={success} />}

					<PrimaryButton loading={loading}>Criar conta</PrimaryButton>
				</form>
			</div>
		</div>
	);
}
