module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/strict', 'prettier'],
  plugins: ['boundaries'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    'import/no-default-export': 'off',
    'react/jsx-key': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'app',
            allow: ['features', 'components', 'lib', 'hooks', 'config', 'types', 'styles'],
          },
          {
            from: 'features',
            allow: ['components', 'lib', 'hooks', 'config', 'types', 'styles'],
          },
          {
            from: 'components',
            allow: ['lib', 'hooks', 'config', 'types', 'styles'],
          },
          {
            from: 'lib',
            allow: ['lib', 'config', 'types'],
          },
          {
            from: 'hooks',
            allow: ['lib', 'types', 'config'],
          },
          {
            from: ['config', 'types', 'styles'],
            allow: ['config', 'types', 'styles'],
          },
        ],
      },
    ],
  },
  settings: {
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/**/*' },
      { type: 'features', pattern: 'src/features/**/*' },
      { type: 'components', pattern: 'src/components/**/*' },
      { type: 'lib', pattern: 'src/lib/**/*' },
      { type: 'hooks', pattern: 'src/hooks/**/*' },
      { type: 'types', pattern: 'src/types/**/*' },
      { type: 'config', pattern: 'src/config/**/*' },
      { type: 'styles', pattern: 'src/styles/**/*' },
    ],
    'boundaries/ignore': ['**/*.test.*', '**/*.spec.*'],
  },
};
