import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier'; // 1. Import this

export default defineConfig([
  {
    ignores: ['**/build/**', '**/node_modules/**', '**/public/*']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [
              // 1. Side effect imports (dotenv, bigint, etc.)
              '^\\u0000',
              // 2. Node.js built-ins (fs, path)
              '^node:',
              // 3. External packages (express)
              '^@?\\w',
              // 4. Anything else (internal files)
              '^'
            ]
          ]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  },
  eslintConfigPrettier // 2. Add this last to disable conflicting rules
]);
