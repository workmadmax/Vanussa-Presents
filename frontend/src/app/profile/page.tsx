/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/26 11:23:11 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/26 11:53:55 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/context/authContext";

type Profile = {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	zipcode: string;
	country: string;
	full_address: string;
	date_joined: string;
};

export default function ProfilePage() {
	const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
	const router = useRouter();

	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [form, setForm] = useState<Partial<Profile>>({});

	useEffect(() => {
		if (authLoading) return;
		if (!isAuthenticated) {
			router.push("/");
			return;
		}
		api
			.get("/users/profile/")
			.then((res) => {
				setProfile(res.data);
				setForm(res.data);
			})
			.finally(() => setLoading(false));
	}, [isAuthenticated, authLoading]);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSave() {
		setSaving(true);
		setSuccess(false);
		try {
			const res = await api.patch("/users/profile/", {
				first_name: form.first_name,
				last_name: form.last_name,
				phone: form.phone,
				street: form.street,
				city: form.city,
				state: form.state,
				zipcode: form.zipcode,
				country: form.country,
			});
			setProfile(res.data);
			setForm(res.data);
			setEditing(false);
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} finally {
			setSaving(false);
		}
	}

	if (authLoading || loading) {
		return (
			<main className="max-w-2xl mx-auto p-6">
				<div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="h-12 bg-gray-200 rounded-xl animate-pulse mb-3"
					/>
				))}
			</main>
		);
	}

	if (!profile) return null;

	return (
		<main className="max-w-2xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-pink-600">Meu Perfil</h1>
				<button
					onClick={logout}
					className="text-sm text-gray-500 hover:text-red-500 transition"
				>
					Sair
				</button>
			</div>

			{success && (
				<div
					className="bg-green-100 text-green-700 px-4 py-2
				rounded-xl mb-4 text-sm"
				>
					Perfil atualizado com sucesso!
				</div>
			)}

			<div className="bg-white rounded-2xl shadow p-6 space-y-4">
				<div className="grid grid-cols-2 gap-4 pb-4 border-b">
					<div>
						<p className="text-xs text-gray-500">Username</p>
						<p className="font-medium">{profile.username}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500">Email</p>
						<p className="font-medium">{profile.email}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500">Membro desde</p>
						<p className="font-medium">
							{new Date(profile.date_joined).toLocaleDateString("pt-BR")}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					{[
						{ label: "Nome", name: "first_name" },
						{ label: "Sobrenome", name: "last_name" },
						{ label: "Telefone", name: "phone" },
						{ label: "Rua", name: "street" },
						{ label: "Cidade", name: "city" },
						{ label: "Estado", name: "state" },
						{ label: "CEP", name: "zipcode" },
						{ label: "País", name: "country" },
					].map(({ label, name }) => (
						<div key={name}>
							<p className="text-xs text-gray-500 mb-1">{label}</p>
							{editing ? (
								<input
									name={name}
									value={(form as any)[name] || ""}
									onChange={handleChange}
									className="w-full border rounded-lg px-3 py-2 text-sm
									focus:outline-none focus:ring-2 focus:ring-pink-300"
								/>
							) : (
								<p className="font-medium text-sm">
									{(profile as any)[name] || (
										<span className="text-gray-400">—</span>
									)}
								</p>
							)}
						</div>
					))}
				</div>

				{profile.full_address && !editing && (
					<div className="pt-2 border-t">
						<p className="text-xs text-gray-500 mb-1">Endereço completo</p>
						<p className="text-sm text-gray-700">{profile.full_address}</p>
					</div>
				)}

				<div className="flex gap-3 pt-2">
					{editing ? (
						<>
							<button
								onClick={handleSave}
								disabled={saving}
								className="bg-pink-500 text-white px-5 py-2
								rounded-xl text-sm font-medium hover:bg-pink-600
								disabled:opacity-50 transition"
							>
								{saving ? "Salvando..." : "Salvar"}
							</button>
							<button
								onClick={() => {
									setEditing(false);
									setForm(profile);
								}}
								className="px-5 py-2 rounded-xl text-sm border
								hover:bg-gray-50 transition"
							>
								Cancelar
							</button>
						</>
					) : (
						<button
							onClick={() => setEditing(true)}
							className="bg-pink-500 text-white px-5 py-2 rounded-xl
							text-sm font-medium hover:bg-pink-600 transition"
						>
							Editar perfil
						</button>
					)}
				</div>
			</div>

			<button
				onClick={() => router.push("/orders")}
				className="mt-4 w-full border rounded-xl py-3 text-sm
				text-gray-600 hover:bg-gray-50 transition"
			>
				Ver histórico de pedidos →
			</button>
		</main>
	);
}
