module.exports = {
  ignorePatterns: ['vite.config.js', 'jsconfig.js', 'build.js'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
      alias: {
        extensions: ['.js', '.vue'],
        map: [
          ['@', './src'],
          ['pdfjs-dist', './node_modules/pdfjs-dist'],
        ],
      },
    },
    'import/core-modules': ['vue', 'pdfjs-dist'],
  },
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'airbnb-base',
    'plugin:import/recommended',
    'plugin:import/errors',
    '@vue/airbnb',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './jsconfig.json',
  },
  plugins: ['vue', 'prettier'],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'object-curly-newline': 'off', // let this be handled by prettier
    'prettier/prettier': ['error'],
    'no-restricted-imports': [
      'error',
      {
        patterns: ['.*'],
      },
    ],
    'vue/html-indent': ['off'], // leave it to prettier
    'vue/multi-word-component-names': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    indent: ['off'], // leave it to prettier
    quotes: ['off'], // leave it to prettier
    'import/prefer-default-export': 'off',
    'import/no-unresolved': ['error', { ignore: ['pdfjs-dist/.*\\.mjs\\?url$'] }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: true,
      },
    ],
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
