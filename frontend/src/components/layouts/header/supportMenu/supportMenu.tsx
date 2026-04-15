/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   supportMenu.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 18:45:03 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 10:32:37 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useRef } from "react";
import { SupportMenuDropdown } from "./contact/supportMenuDropDown";
import { WhatsAppContact } from "./contact/whatsAppContact";
import { EmailContact } from "./contact/emailContact";
import { TrackingForm } from "./contact/trackingForms";
import { useSupportMenu } from "./hooks/useSupportMenu";
import { useClickOutside } from "@/hooks/useClickOutside";

export function SupportMenu({ children }: { children: React.ReactNode }) {
  const { isOpen, toggleMenu, closeMenu } = useSupportMenu();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    if (isOpen) closeMenu();
  });

  return (
    <div ref={menuRef} className="relative font-sans z-50">
      <button
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="cursor-pointer transition-transform duration-200 active:scale-95 bg-transparent border-none p-0 w-full text-left"
      >
        {children}
      </button>

      {isOpen && (
        <SupportMenuDropdown>
          <WhatsAppContact />
          <EmailContact />
          <TrackingForm />
        </SupportMenuDropdown>
      )}
    </div>
  );
}
