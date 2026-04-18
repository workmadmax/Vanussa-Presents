/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   modalComponents.tsx                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/17 21:57:58 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/17 22:04:19 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect } from "react";
import { X } from "lucide-react";

/* ================= HOOK ================= */

export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
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

/* ================= LAYOUT ================= */

export function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="absolute inset-0 bg-black/50" onClick={onClose} />;
}

export function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onClose} 
        aria-label="closed modal" className="text-gray-500 hover:text-gray-700">
        <X size={20} />
      </button>
    </div>
  );
}

/* ================= FORM COMPONENTS ================= */

export type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputField({
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

export function FeedbackMessage({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  const styles = {
    error: "text-red-500 bg-red-50",
    success: "text-green-600 bg-green-50",
  };

  return (
    <div className={`text-sm p-2 rounded-lg ${styles[type]}`}>{message}</div>
  );
}

/* ================= BUTTONS ================= */

export function PrimaryButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      disabled={loading}
      className="rounded-xl bg-black py-3 text-white hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-xl border py-3 text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

export function GoogleButton() {
  return (
    <button
      type="button"
      className="rounded-xl bg-red-500 py-3 text-white hover:bg-red-600"
    >
      Google
    </button>
  );
}
