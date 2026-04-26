import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,

	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

		rules: {
			/*
			|--------------------------------------------------------------------------
			| ALLMAN STYLE
			|--------------------------------------------------------------------------
			| Força abertura de chaves na linha seguinte
			|
			| if (x)
			| {
			|	doSomething();
			| }
			*/

			"brace-style": ["error", "allman", { allowSingleLine: false }],

			/*
			|--------------------------------------------------------------------------
			| BOAS PRÁTICAS EXTRAS
			|--------------------------------------------------------------------------
			*/

			curly: ["error", "all"],
			"no-trailing-spaces": "error",
			"eol-last": ["error", "always"],
			semi: ["error", "always"],
		},
	},

	// Override default ignores of eslint-config-next
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
