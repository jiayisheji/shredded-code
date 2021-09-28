module.exports = {
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'jest', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json', // https://github.com/typescript-eslint/typescript-eslint/issues/967#issuecomment-530907956
    ecmaVersion: 2021,
    sourceType: 'module',
    extraFileExtensions: ['.md', '.yml'],
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    jest: {
      version: 27, // vscode extension can't find jest - "Error while loading rule 'jest/no-deprecated-functions': Unable to detect Jest version - please ensure jest package is installed, or otherwise set version explicitly"
    },
  },
  rules: {
    'prettier/prettier': ['warn', require('./.prettierrc')],

    'jest/expect-expect': [
      'error', // br
      {assertFunctionNames: ['expect', 'expectTypeOf', 'expectLeft', 'expectRight']},
    ],

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
