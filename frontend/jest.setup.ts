/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jest.setup.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 20:20:11 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 21:42:38 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import '@testing-library/jest-dom';


if (typeof window !== 'undefined') {
    
    Object.defineProperty(window, '_location', {
        configurable: true,
        value: new URL('http://localhost/'),
    });
}


