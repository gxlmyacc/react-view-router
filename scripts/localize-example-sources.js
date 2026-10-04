const fs = require('fs');
const { parseSync } = require('@babel/core');

/** Parse without project transforms. @param {string} content Script source. @returns {object} Babel syntax tree. */
function parse(content) {
  return parseSync(content, {
    babelrc: false,
    configFile: false,
    parserOpts: { sourceType: 'unambiguous', plugins: ['typescript', 'jsx'] }
  });
}

/** Visit syntax nodes. @param {any} node Syntax node. @param {(node: any) => void} callback Node visitor. */
function visit(node, callback) {
  if (!node || typeof node.type !== 'string') return;
  callback(node);
  Object.keys(node).forEach((key) => {
    const child = node[key];
    if (Array.isArray(child)) child.forEach((item) => visit(item, callback));
    else if (child && typeof child === 'object') visit(child, callback);
  });
}

/** Read static messages without executing TS. @param {string} filename Catalog path. @returns {Record<string, Record<string, string>>} */
function readMessages(filename) {
  const ast = parse(fs.readFileSync(filename, 'utf8'));
  let messages;
  visit(ast, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id.name !== 'messages') return;
    const object = node.init.type === 'TSAsExpression' ? node.init.expression : node.init;
    messages = Object.fromEntries(object.properties.map((locale) => [locale.key.name,
      Object.fromEntries(locale.value.properties.map((property) => [property.key.name || property.key.value, property.value.value]))]));
  });
  if (!messages) throw new Error(`Missing translation messages: ${filename}`);
  return messages;
}

/**
 * Record translation call ranges once. No translated source or language variants are emitted.
 * @param {{path: string, content: string}[]} files Original example sources.
 * @param {{en: Record<string, string>}} messages Catalog used only to identify possible dynamic keys.
 * @returns {object[]} Original files with optional translation metadata.
 */
function collectExampleTranslations(files, messages) {
  const parsed = files.map((file) => ({
    ...file,
    ast: /\.[jt]sx?$/.test(file.path) ? parse(file.content) : null
  }));
  const knownKeys = new Set();
  parsed.forEach((file) => visit(file.ast, (node) => {
    if (node.type === 'StringLiteral' && Object.prototype.hasOwnProperty.call(messages.en, node.value)) knownKeys.add(node.value);
  }));
  return parsed.map(({ ast, ...file }) => {
    if (!ast) return file;
    const original = (node) => file.content.slice(node.start, node.end);
    const describe = (node) => {
      if (node.type === 'StringLiteral') return { kind: 'text', key: node.value };
      if (node.type === 'TemplateLiteral' && !node.expressions.length) return { kind: 'text', key: node.quasis[0].value.cooked };
      if (node.type === 'ConditionalExpression') return {
        kind: 'conditional',
        test: original(node.test),
        consequent: describe(node.consequent),
        alternate: describe(node.alternate),
      };
      let hasObject = false;
      const values = [];
      visit(node, (child) => {
        if (child.type === 'ObjectExpression') hasObject = true;
        if (child.type === 'ObjectProperty' && child.value.type === 'StringLiteral') values.push({
          start: child.value.start - node.start, end: child.value.end - node.start, key: child.value.value,
        });
      });
      if (hasObject) return { kind: 'object', expression: original(node), values };
      let keys = Array.from(knownKeys);
      if (node.type === 'TemplateLiteral') {
        const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`^${node.quasis.map((part) => escape(part.value.cooked)).join('.*')}$`);
        keys = Object.keys(messages.en).filter((key) => pattern.test(key));
      }
      return { kind: 'lookup', expression: original(node), keys };
    };
    const translations = [];
    visit(ast, (node) => {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier'
        && node.callee.name === 't' && node.arguments.length === 1) translations.push({
        start: node.start, end: node.end, value: describe(node.arguments[0]),
      });
    });
    return translations.length ? { ...file, translations } : file;
  });
}

/** @param {string} content Script source. @returns {string[]} Runtime relative imports. */
function getSourceImports(content) {
  const imports = [];
  visit(parse(content), (node) => {
    if (node.type === 'ImportDeclaration' && node.importKind !== 'type'
      && (!node.specifiers.length || node.specifiers.some((item) => item.importKind !== 'type'))) imports.push(node.source.value);
    if (node.type === 'CallExpression' && node.callee.type === 'Import' && node.arguments[0]?.type === 'StringLiteral') {
      imports.push(node.arguments[0].value);
    }
  });
  return imports.filter((request) => request.startsWith('.'));
}

module.exports = { readMessages, collectExampleTranslations, getSourceImports };
