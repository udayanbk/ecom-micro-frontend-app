// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1️⃣ Global ignores (THIS is where Prisma files go)
  {
    ignores: [
      'eslint.config.mjs',
      'prisma.config.ts',
      'prisma/seed.ts',
      'dist/**',
      'node_modules/**',
    ],
  },

  // 2️⃣ Base JS + TS recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // 3️⃣ Prettier integration
  eslintPluginPrettierRecommended,

  // 4️⃣ Language options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 5️⃣ Project-specific rule tweaks
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
