import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        particlesJS: 'readonly',
        WOW: 'readonly',
        location: 'readonly',
        setInterval: 'readonly'
      }
    },
    rules: {
      // カスタムルールがあればここに追加
    }
  },
  {
    ignores: [
      'src/dist/**',
      'node_modules/**'
    ]
  }
];