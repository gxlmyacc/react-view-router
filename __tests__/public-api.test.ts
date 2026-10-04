import { createHash } from 'crypto';
import ts from 'typescript';

// Includes navigation loop protection configuration and diagnostic error types.
const PUBLIC_API_EXPORT_COUNT = 293;
const PUBLIC_API_EXPORT_SHA256 = '22a5917a478d590e854afb1875958e8e4f690c870c0921d6c1d99f4105e3a9ea';

function readPublicApiExports() {
  const program = ts.createProgram(
    ['src/index.ts'],
    {
      allowJs: true,
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      skipLibCheck: true,
      target: ts.ScriptTarget.ESNext,
    },
  );
  const source = program.getSourceFile('src/index.ts');
  if (!source) throw new Error('src/index.ts cannot be found');

  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error('react-view-router root module symbol cannot be resolved');

  return checker.getExportsOfModule(moduleSymbol)
    .map((item) => item.getName())
    .sort();
}

describe('public api compatibility', () => {
  it('应保持根入口导出集合不被意外删除或改名', () => {
    const exportNames = readPublicApiExports();
    const hash = createHash('sha256').update(exportNames.join('\n')).digest('hex');

    expect({
      count: exportNames.length,
      hash,
    }).toEqual({
      count: PUBLIC_API_EXPORT_COUNT,
      hash: PUBLIC_API_EXPORT_SHA256,
    });
  });
});
