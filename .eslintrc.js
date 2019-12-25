module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
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
    'define': true,
    '__DEV__': true,
    '__ENV__': true,
    '__VERSION__': true,
    '__WATCH__': true,
    '$': true,
    'importCss': true,
    'importJs': true
  },
  rules: {
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: [
          'invalidHref'
        ]
      }
    ],
    // 强制数组方法的回调函数中有 return 语句
    'array-callback-return': 0,
    // 要求箭头函数的参数使用圆括号
    'arrow-parens': [2, 'as-needed'],
    // 如果一个类方法没有使用this，那么必须将该方法转换为静态函数
    'class-methods-use-this': 0,
    // 数组和对象键值对最后一个逗号，never参数：不能带末尾的逗号, always参数：必须带末尾的逗号，always-multiline：多行模式必须带逗号，单行模式不能带逗号
    'comma-dangle': [0, { arrays: 'ignore', exports: 'never', functions: 'ignore', imports: 'never', objects: 'ignore' }],
    // 要求 return 语句要么总是指定返回的值，要么不指定
    'consistent-return': 0,
    // 强制所有控制语句使用一致的括号风格
    'curly': [0, 'multi-or-nest'],
    // switch 语句强制 default 分支，也可添加 // no default 注释取消此次警告
    'default-case': 2,
    // 文件末尾强制换行
    'eol-last': 0,
    // 使用 === 替代 == allow-null允许null和undefined==
    'eqeqeq': 0,
    // 强制使用命名的 function 表达式
    'func-names': 0,
    // 要求 require() 出现在顶层模块作用域中
    'global-require': 0,
    // 禁止使用动态require语句
    'import/no-dynamic-require': 0,
    'import/no-extraneous-dependencies': 0,
    // 禁止导出使用var或let声明的变量
    'import/no-mutable-exports': 0,
    'import/no-unresolved': 0,
    // 如果只导出一个时，优先使用default导出
    'import/prefer-default-export': 0,
    // 控制缩进
    'indent': [2, 2, { SwitchCase: 1 }],
    // 强制在 JSX 属性中一致地使用双引号或单引号
    'jsx-quotes': 2,
    // 强制使用一致的换行风格
    'linebreak-style': 0,
    // 强制一行的最大长度
    'max-len': [2, { code: 150, tabWidth: 2, ignoreRegExpLiterals: true }],
    // 禁止在循环中使用await
    'no-await-in-loop': 0,
    // 禁用按位运算符
    'no-bitwise': 0,
    // 不允许在 case 子句中使用词法声明
    'no-case-declarations': 2,
    // 禁止条件表达式中出现赋值操作符
    'no-cond-assign': 0,
    // 禁用 console
    'no-console': 0,
    // 禁止在条件中使用常量表达式
    'no-constant-condition': 2,
    // 禁用 continue 语句
    'no-continue': 0,
    // 禁止出现空函数.如果一个函数包含了一条注释，它将不会被认为有问题。
    'no-empty-function': 0,
    // 禁用 eval()
    'no-eval': 2,
    // 禁止扩展原生类型
    'no-extend-native': 0,
    // 禁止 if 作为唯一的语句出现在 else 语句中
    'no-lonely-if': 0,
    // 禁止混合使用不同的操作符
    'no-mixed-operators': 2,
    // 禁止在单个语句中使用多个赋值
    'no-multi-assign': 0,
    // 禁止使用多个空格
    'no-multi-spaces': 0,
    // 不允许多个空行
    'no-multiple-empty-lines': [2, { max: 2, maxEOF: 1 }],
    // 不允许使用嵌套的三元表达式
    'no-nested-ternary': 0,
    // 禁止在非赋值或条件语句中使用 new 操作符
    'no-new': 2,
    // 禁止对 function 的参数进行重新赋值
    'no-param-reassign': 0,
    // 禁止使用++、--这样的运算符
    'no-plusplus': 0,
    // 禁用 __proto__ 属性
    'no-proto': 2,
    // 禁用特定的全局变量
    'no-restricted-globals': 0,
    // 禁止在return语句中使用赋值语句
    'no-return-assign': 0,
    // 禁止使用return await
    'no-return-await': 0,
    // 禁止 var 声明 与外层作用域的变量同名
    'no-shadow': 0,
    // 禁止抛出非异常字面量
    'no-throw-literal': 0,
    // 禁用行尾空格
    'no-trailing-spaces': 1,
    // 禁止标识符中有下划线
    'no-underscore-dangle': 0,
    // 禁止在finally语句中使用return，throw，break，和continue
    'no-unsafe-finally': 0,
    // 禁止出现未使用过的表达式 allowShortCircuit:允许短路写法 allowTernary:允许三元表达式
    'no-unused-expressions': [2, { allowShortCircuit: true, allowTernary: true }],
    // 禁止出现未使用过的变量
    'no-unused-vars': [2, { args: 'none', vars: 'all' }],
    // 禁用不必要的转义字符
    'no-useless-escape': 2,
    // 强制花括号内换行符的一致性
    "object-curly-newline": [2, { multiline: true, consistent: true }],
    // 强制将对象的属性放在不同的行上
    "object-property-newline": [2, { allowAllPropertiesOnSameLine: true }],
    // 要求对象字面量中方法和属性使用简写语法
    "object-shorthand": [2, 'always'],
    // 强制函数中的变量要么一起声明要么分开声明
    "one-var": [2, { initialized: 'never', uninitialized: 'never' }],
    // 在变量声明周围执行一致的换行符。这条规则忽略了for循环条件中的变量声明
    "one-var-declaration-per-line": [2, 'initializations'],
    // 强制操作符使用一致的换行符
    "operator-linebreak": [2, 'before', { overrides: { ':': 'before', '?': 'before' } }],
    "padded-blocks": [2, { blocks: 'never', switches: 'never', classes: 'always' }],
    // 要求使用箭头函数作为回调
    'prefer-arrow-callback': 0,
    // 要求使用 const 声明那些声明后不再被修改的变量
    'prefer-const': 0,
    // 强制使用解构而不是通过成员表达式访问属性
    'prefer-destructuring': 0,
    // promise只能reject Error类型的数据
    'prefer-promise-reject-errors': 0,
    // 使用展开参数替代arguments
    'prefer-rest-params': 0,
    // 要求使用模板字面量而非字符串连接
    'prefer-template': 0,
    // 强制在parseInt()使用基数参数
    'radix': [2, 'as-needed'],
    // 强制分号之前和之后使用一致的空格
    // 'semi-spacing': [0, { after: true, before: false }],
    // 将立即调用函数表达式用括号括起来
    'wrap-iife': [2, 'inside']
  }
}
