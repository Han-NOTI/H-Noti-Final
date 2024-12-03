// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';


export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: {
      js: pluginJs,
      react: pluginReact,
    },
    rules: {
      'no-console': 'warn',
      // 기본 React 관련 규칙
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
