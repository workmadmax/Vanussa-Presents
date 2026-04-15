/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/13 20:23:54 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/15 17:09:36 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/types/index.ts

/**
 * Representa uma imagem de produto vinda da API
 */
export interface ProductImage {
  image: string;
}

/**
 * Representa uma categoria de produtos
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
}

/**
 * Representa a estrutura completa de um Produto
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description?: string; // Opcional
  images: ProductImage[];
}

/**
 * Tipagem para respostas genéricas da API (opcional, mas recomendado)
 */
export interface ApiResponse<T> {
  data: T;
}