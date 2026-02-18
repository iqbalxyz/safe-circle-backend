import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/build/**', '**/node_modules/**', '**/public/*']
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  // ⬅️ ADD THIS BLOCK
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  {
    files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
]);
