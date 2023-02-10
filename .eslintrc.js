module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:@next/next/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
  },
  plugins: [
    'react',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': ['error', {
      'custom': 'ignore',
    }],
    'jsx-a11y/anchor-is-valid': 'off',
    'linebreak-style': 'off',
    'no-multiple-empty-lines': 'off',
    'no-console': 'off',
  },
};
