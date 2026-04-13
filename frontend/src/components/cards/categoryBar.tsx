/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   categoryBar.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/13 12:23:16 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/13 14:15:30 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get("/categories/").then((res) => {
      setCategories(res.data);
    });
  }, []);

  return (
    <div className="w-full bg-gray-100 border-b relative">
      <div className="max-w-6xl mx-auto flex items-center gap-4 p-3">
        {/*  BOTÃO TODAS */}
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button className="bg-pink-500 text-white px-4 py-2 rounded-full">
            Todas ☰
          </button>
          {/* DROPDOWN */}
          {open && (
            <div className="absolute top-12 left-0 bg-white shadow-lg rounded-xl p-3 w-48 z-50">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/?category=${cat.slug}`}>
                  <div
                    key={cat.id}
                    className="p-2 hover:bg-pink-100 rounded cursor-pointer"
                  >
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {/*  LISTA HORIZONTAL */}
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/?category=${cat.slug}`}>
              <button
                key={cat.id}
                className="bg-white px-4 py-2 rounded-full shadow hover:bg-pink-500 hover:text-white transition whitespace-nowrap"
              >
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
