/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jest.config.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/14 21:27:42 by mdouglas          #+#    #+#             */
/*   Updated: 2026/04/14 21:29:49 by mdouglas         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // 1. ISSO AQUI RESOLVE O ERRO DO "_location"
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },

  // 2. ISSO AQUI RESOLVE O ERRO DE NÃO ACHAR O MÓDULO "@/..."
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testMatch: ["**/__tests__/**/*.(ts|tsx)"],
};

export default createJestConfig(config);