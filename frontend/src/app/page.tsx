/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   page.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/09 21:43:32 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/09 22:18:46 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function Home() {
  const [ products, setProducts ] = useState<any[]>([]);
  
  useEffect(() => {
    api.get('products/').then((res) => {
      setProducts(res.data);
    });
  }, []);

    return (
    <main style={{ padding: 20 }}>
      <h1>Vanusa Presentes 💎</h1>

      {products.map((product) => (
        <div key={product.id} style={{ marginBottom: 20 }}>
          <h2>{product.name}</h2>
          <p>R$ {product.price}</p>
        </div>
      ))}
    </main>
  );
}
