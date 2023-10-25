module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'airbnb-base',
    'react-app'
  ],
  plugins: [],
  settings: {
    // "import/resolver": {
    //   webpack: {
    //     config: './build/webpack-dev.config.js'
    //   },
    // },
    react: {
      version: require('./package.json').dependencies.react,
    },
  },
  globals: {
    define: true,
    __DEV__: true,
    __ENV__: true,
    __VERSION__: true,
    __WATCH__: true,
  },
  rules: {
    'array-callback-return': 0,
    'arrow-parens': [2, 'as-needed'],
    'class-methods-use-this': 0,
    'comma-dangle': [0, {
      arrays: 'ignore',
      exports: 'never',
      functions: 'ignore',
      imports: 'never',
      objects: 'ignore'
    }],
    'consistent-return': 0,
    curly: [0, 'multi-or-nest'],
    'eol-last': 0,
    eqeqeq: 0,
    'func-names': 0,
    'global-require': 0,
    'implicit-arrow-linebreak': 0,
    'import/extensions': 0,
    'import/no-dynamic-require': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-relative-packages': 0,
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    indent: [2, 2, {
      SwitchCase: 1
    }],
    'jsx-quotes': 2,
    'linebreak-style': 0,
    'max-len': [2, {
      code: 150,
      ignoreRegExpLiterals: true,
      tabWidth: 2
    }],
    'no-async-promise-executor': 0,
    'no-await-in-loop': 0,
    'no-bitwise': 0,
    'no-case-declarations': 2,
    'no-cond-assign': 0,
    'no-console': 0,
    'no-constant-condition': 2,
    'no-continue': 0,
    'no-empty-function': 0,
    'no-eval': 2,
    'no-extend-native': 0,
    'no-lonely-if': 0,
    'no-mixed-operators': 2,
    'no-multi-assign': 0,
    'no-multi-spaces': 0,
    'no-multiple-empty-lines': [2, {
      max: 2,
      maxEOF: 1
    }],
    'no-nested-ternary': 0,
    'no-new': 2,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-proto': 2,
    'no-restricted-globals': 0,
    'no-return-assign': 0,
    'no-return-await': 0,
    'no-shadow': 0,
    'no-throw-literal': 0,
    'no-trailing-spaces': 1,
    'no-underscore-dangle': 0,
    'no-unsafe-finally': 0,
    'no-unused-expressions': [2, {
      allowShortCircuit: true,
      allowTernary: true
    }],
    'no-unused-vars': [2, {
      args: 'none',
      vars: 'all'
    }],
    'no-useless-escape': 2,
    'object-curly-newline': [2, {
      consistent: true,
      multiline: true
    }],
    'object-property-newline': [2, {
      allowAllPropertiesOnSameLine: true
    }],
    'object-shorthand': [2, 'always'],
    'one-var': [2, {
      initialized: 'never',
      uninitialized: 'never'
    }],
    'one-var-declaration-per-line': [2, 'initializations'],
    'operator-linebreak': [2, 'before', {
      overrides: {
        ':': 'before',
        '?': 'before'
      }
    }],
    'padded-blocks': [2, {
      blocks: 'never',
      classes: 'always',
      switches: 'never'
    }],
    'prefer-arrow-callback': 0,
    'prefer-const': [2, {
      destructuring: 'all'
    }],
    'prefer-destructuring': 0,
    'prefer-object-spread': 0,
    'prefer-promise-reject-errors': 0,
    'prefer-rest-params': 0,
    'prefer-template': 0,
    radix: [2, 'as-needed'],
    'wrap-iife': [2, 'inside']
  }
};
