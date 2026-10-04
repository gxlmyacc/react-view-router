import path from 'path';
import { parseSync } from '@babel/core';
import { localizeExampleSource } from '../demo_react_shared/src/workspace/example-source';
import { createTranslator } from '../demo_react_shared/src/workspace/i18n';
import type { ExampleSourceFile } from '../demo_react_shared/src/workspace/example-source';

const { collectExampleTranslations, readMessages } = require('../scripts/localize-example-sources');
const { collectExampleSources } = require('../scripts/prepare-playground-assets');

const messages = readMessages(path.resolve(__dirname, '../demo_react_shared/src/workspace/i18n.ts'));

function source(content: string): ExampleSourceFile {
  return collectExampleTranslations([{ path: 'App.tsx', content }], messages)[0];
}

describe('example source localization', () => {
  it('changes only real calls, escapes text as code, and preserves original source', () => {
    const content = '// t(\'drawerWidth\')\nconst sample = "t(\'drawerWidth\')";\nconst width = t(\'drawerWidth\');\nconst unknown = t(\'missing\');';
    const file = source(content);
    const localized = localizeExampleSource(file, createTranslator('zh'));
    expect(localized).toContain('// t(\'drawerWidth\')');
    expect(localized).toContain('const sample = "t(\'drawerWidth\')";');
    expect(localized).toContain('const width = "宽度"');
    expect(localized).toContain('const unknown = "missing"');
    expect(file.content).toBe(content);
    expect(file).not.toHaveProperty('localizedContent');
    const escaped = localizeExampleSource(source("t('drawerWidth')"), () => '"quote"\n{value}\\path');
    expect(escaped).toBe(JSON.stringify('"quote"\n{value}\\path'));
  });

  it('preserves conditional logic and resolves both branches with the current translator', () => {
    const file = source("const result = t(ok ? 'drawerWidth' : 'drawerHeight');");
    expect(localizeExampleSource(file, createTranslator('en'))).toContain('(ok ? "Width" : "Height")');
    expect(localizeExampleSource(file, createTranslator('zh'))).toContain('(ok ? "宽度" : "高度")');
  });

  it('resolves dynamic template families and inline maps without translating business values', () => {
    const directionExpression = ['`drawerDirection_', '$', '{position}`'].join('');
    const file = source([
      "const action = 'block';",
      `const direction = t(${directionExpression});`,
      "const size = t(({ width: 'drawerWidth' })[axis]);",
    ].join(' '));
    const localized = localizeExampleSource(file, createTranslator('zh'));
    expect(localized).toContain("action = 'block'");
    expect(localized).toContain('"drawerDirection_center": "中间"');
    expect(localized).toContain(directionExpression);
    expect(localized).toContain('width: "宽度"');
    expect(localized).not.toContain('t(');
  });

  it('supports dynamic keys provided by other files of the same example', () => {
    const files = collectExampleTranslations([
      { path: 'App.tsx', content: 'const text = t(titleKey);' },
      { path: 'routes.ts', content: "const titleKey = 'drawerWidth';" },
    ], messages);
    const localized = localizeExampleSource(files[0], createTranslator('en'));
    expect(localized).toContain('"drawerWidth": "Width"');
    expect(localized).toContain('(titleKey)');
    expect(localizeExampleSource(files[1], createTranslator('zh'))).toBe(files[1].content);
  });

  it('prepares every example without language variants and produces syntactically valid localized scripts', () => {
    const manifest = collectExampleSources(path.resolve(__dirname, '../demo_react_shared/src/examples'));
    Object.values(manifest).forEach((workspace: any) => workspace.files.forEach((file: ExampleSourceFile) => {
      expect(file).not.toHaveProperty('localizedContent');
      ['zh', 'en'].forEach((locale) => {
        const content = localizeExampleSource(file, createTranslator(locale as 'zh' | 'en'));
        if (/\.[jt]sx?$/.test(file.path)) expect(() => parseSync(content, {
          babelrc: false, configFile: false, parserOpts: { plugins: ['typescript', 'jsx'] },
        })).not.toThrow();
        else expect(content).toBe(file.content);
      });
    }));
  });
});
