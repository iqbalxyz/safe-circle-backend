import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/build/**', '**/node_modules/**', '**/public/*']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Ensure this matches your file extension
    files: ['**/*.ts', '**/*.mts'],
    plugins: {
      // This key MUST match the prefix used in the rules below
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // This regex merges all imports into one single group
            ['^\\u0000', '^@?\\w', '^']
          ]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  }
]);
