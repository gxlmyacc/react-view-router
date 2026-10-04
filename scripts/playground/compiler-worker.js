/* global importScripts, ts */
importScripts('./typescript.js');

function combineSelectors(parents, children) {
  if (!parents.length) return children;
  const result = [];
  parents.forEach(function eachParent(parent) {
    children.forEach(function eachChild(child) {
      result.push(child.indexOf('&') >= 0 ? child.replace(/&/g, parent) : parent + ' ' + child);
    });
  });
  return result;
}

function findClosingBrace(source, openingIndex) {
  let depth = 1;
  for (let index = openingIndex + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (!depth) return index;
  }
  throw new Error('SCSS block is missing a closing brace.');
}

function flattenScssRegion(source, parents) {
  let output = '';
  let cursor = 0;
  let openingIndex = source.indexOf('{', cursor);
  while (openingIndex >= 0) {
    const header = source.slice(cursor, openingIndex);
    const declarationEnd = header.lastIndexOf(';');
    const declarations = declarationEnd >= 0 ? header.slice(0, declarationEnd + 1).trim() : '';
    const selector = header.slice(declarationEnd + 1).trim();
    if (declarations && parents.length) output += parents.join(', ') + ' { ' + declarations + ' }\n';
    const closingIndex = findClosingBrace(source, openingIndex);
    if (selector.charAt(0) === '@') {
      output += selector + ' {\n' + flattenScssRegion(source.slice(openingIndex + 1, closingIndex), parents) + '}\n';
      cursor = closingIndex + 1;
      openingIndex = source.indexOf('{', cursor);
      continue;
    }
    const children = selector.split(',').map(function trim(value) { return value.trim(); }).filter(Boolean);
    output += flattenScssRegion(
      source.slice(openingIndex + 1, closingIndex),
      combineSelectors(parents, children),
    );
    cursor = closingIndex + 1;
    openingIndex = source.indexOf('{', cursor);
  }
  const tail = source.slice(cursor).trim();
  if (tail) output += parents.length ? parents.join(', ') + ' { ' + tail + ' }\n' : tail + '\n';
  return output;
}

function compileScss(source) {
  const variables = {};
  source = source.replace(/^\s*\/\/[^\n]*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/:scope\b/g, '');
  source = source.replace(/\$([\w-]+)\s*:\s*([^;]+);/g, function saveVariable(_match, name, value) {
    variables[name] = value.trim();
    return '';
  });
  Object.keys(variables).forEach(function replaceVariable(name) {
    source = source.replace(new RegExp('\\$' + name + '\\b', 'g'), variables[name]);
  });
  return flattenScssRegion(source, []);
}

self.addEventListener('message', function compile(event) {
  const request = event.data || {};
  if (request.type !== 'react-viewplayground-compile') return;

  try {
    const files = request.files || [];
    const diagnostics = [];
    const modules = files.filter(function isScript(file) {
      return /\.[jt]sx?$/.test(file.path);
    }).map(function transpile(file) {
      const result = ts.transpileModule(file.content, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          jsx: ts.JsxEmit.React,
          module: ts.ModuleKind.CommonJS,
          esModuleInterop: true,
          ignoreDeprecations: '6.0',
        },
        reportDiagnostics: true,
        fileName: file.path,
      });
      (result.diagnostics || []).forEach(function format(diagnostic) {
        diagnostics.push(file.path + ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      });
      return { path: file.path, code: result.outputText };
    });
    const factories = modules.map(function createFactory(moduleInfo) {
      return '__factories[' + JSON.stringify(moduleInfo.path) + '] = function(module, exports, require) {\n'
        + moduleInfo.code + '\n};';
    }).join('\n');
    const runtime = [
      'var __factories = {};',
      factories,
      'var __cache = {};',
      'var __extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];',
      'function __normalize(path) {',
      '  var result = [];',
      '  path.split("/").forEach(function(part) {',
      '    if (!part || part === ".") return;',
      '    if (part === "..") result.pop(); else result.push(part);',
      '  });',
      '  return result.join("/");',
      '}',
      'function __resolve(request, from) {',
      '  var slash = from.lastIndexOf("/");',
      '  var directory = slash < 0 ? "" : from.slice(0, slash);',
      '  var base = request.charAt(0) === "." ? __normalize(directory + "/" + request) : __normalize(request);',
      '  for (var i = 0; i < __extensions.length; i += 1) {',
      '    var candidate = base + __extensions[i];',
      '    if (Object.prototype.hasOwnProperty.call(__factories, candidate)) return candidate;',
      '  }',
      '  throw new Error("Cannot resolve module " + request + " from " + from);',
      '}',
      'function __require(request, from) {',
      '  if (request === "react") return React;',
      '  if (request === "react-view-router") return ReactViewRouterLib;',
      '  if (typeof PlaygroundModules !== "undefined" && Object.prototype.hasOwnProperty.call(PlaygroundModules, request)) {',
      '    return PlaygroundModules[request];',
      '  }',
      '  if (/\\.(css|scss|sass)(?:\\?.*)?$/.test(request)) return {};',
      '  var id = __resolve(request, from || "");',
      '  if (__cache[id]) return __cache[id].exports;',
      '  var module = { exports: {} };',
      '  __cache[id] = module;',
      '  __factories[id](module, module.exports, function(child) { return __require(child, id); });',
      '  return module.exports;',
      '}',
      'var __entry = __require(' + JSON.stringify(request.entry || 'src/App.tsx') + ', "");',
      'return __entry.default || __entry.PlaygroundApp || __entry;',
    ].join('\n');
    const css = files.filter(function isStyle(file) {
      return /\.(css|scss|sass)$/.test(file.path);
    }).map(function joinStyle(file) {
      const content = /\.scss$/.test(file.path) ? compileScss(file.content) : file.content;
      return '/* ' + file.path + ' */\n' + content;
    }).join('\n\n');
    self.postMessage({
      type: 'react-viewplayground-compiled',
      id: request.id,
      code: runtime,
      css,
      diagnostics,
    });
  } catch (error) {
    self.postMessage({
      type: 'react-viewplayground-compiled',
      id: request.id,
      code: '',
      css: '',
      diagnostics: [error && error.message ? error.message : String(error)],
    });
  }
});
