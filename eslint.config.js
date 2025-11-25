const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', 'expo-env.d.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    // Updated: Added 'jest.setup.js' to this list
    files: [
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)',
      'jest.setup.js',
    ],
    plugins: {
      'testing-library': testingLibrary,
    },
    languageOptions: {
      // Updated: Explicitly tell ESLint that 'jest' exists as a global variable
      globals: {
        jest: 'readonly',
        jasmine: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
]);
