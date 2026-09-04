// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import noRawDesignTokenCssVar from './tools/eslint-rules/no-raw-design-token-css-var.js';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.angular/**',
      '**/*.generated.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        // playwright.config.ts lives at the repo root, outside every leaf tsconfig's `include`
        // (it's a tooling config, not app/lib/e2e source) -- allowDefaultProject lets the
        // type-aware project service lint it against a synthetic single-file program instead of
        // requiring it to belong to a real tsconfig project.
        projectService: {
          allowDefaultProject: ['playwright.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      ums: { rules: { 'no-raw-design-token-css-var': noRawDesignTokenCssVar } },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['ums', 'app'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['ums', 'app'], style: 'kebab-case' },
      ],
      // DSYS-19 consumption-contract enforcement -- edge-cases.md "A Component Consuming a
      // Token That a Later Token-Set Version Renames or Removes".
      'ums/no-raw-design-token-css-var': 'error',
    },
  },
  {
    // The token/icon codegen scripts are the one legitimate place a raw var(--token-name)
    // string is *supposed* to be produced -- they generate tokens.css/tokens.generated.ts from
    // tools/tokens/source/*.json, and the string builder inside them necessarily assembles
    // `var(--${token.name})` literals.
    files: ['tools/tokens/build-tokens.mjs', 'tools/icons/build-icons.mjs'],
    rules: {
      'ums/no-raw-design-token-css-var': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  {
    // Plain-Node build/codegen scripts (tools/tokens, tools/icons) -- not part of the Angular
    // TypeScript project, so plain (non-type-aware) JS linting only.
    files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
    extends: [eslint.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
);
