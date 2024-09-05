module.exports = {
  ignorePatterns: ['vite.config.js', 'jsconfig.js', 'build.js'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
      alias: {
        extensions: ['.js', '.vue'],
        map: [['@', './src']],
      },
    },
    'import/core-modules': ['vue'],
  },
  env: {
    browser: true,
    es2021: true,
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
    'indent': ['off'], // leave it to prettier
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
