module.exports = {
  root: true,
  extends: ['../.eslintrc.js'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'arrow-parens': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-restricted-exports': 0,
    'object-property-newline': 0,
    'padded-blocks': 0,
    'react/prop-types': 0,
  },
};
