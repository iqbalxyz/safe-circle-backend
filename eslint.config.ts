import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // Global Ignores
  {
    ignores: ['**/build/**', '**/node_modules/**', '**/public/*']
  },

  // Base JS Recommended
  js.configs.recommended,

  // TypeScript Recommended (Spread the array)
  ...tseslint.configs.recommended,

  // Custom Settings (Env, ParserOptions, Rules)
  {
    files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
      // parser: tseslint.parser is already included in tseslint.configs.recommended
    },
    rules: {
      // Your specific overrides
    }
  }
]);
