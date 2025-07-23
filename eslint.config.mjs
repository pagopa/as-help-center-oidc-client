import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['dist', 'node_modules', 'build', 'tsconfig.json', '.husky/install.mjs', 'jest.*.js', 'coverage'],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        Express: 'readonly',
      },
    },
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  eslintPluginPrettierRecommended,
];
