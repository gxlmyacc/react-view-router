import type { Translator } from './i18n';

interface SourceRange { start: number; end: number }
export type TranslationExpression =
  | { kind: 'text'; key: string }
  | { kind: 'conditional'; test: string; consequent: TranslationExpression; alternate: TranslationExpression }
  | { kind: 'object'; expression: string; values: (SourceRange & { key: string })[] }
  | { kind: 'lookup'; expression: string; keys: string[] };

export interface ExampleSourceFile {
  path: string;
  content: string;
  translations?: (SourceRange & { value: TranslationExpression })[];
}

function replaceRanges(content: string, replacements: (SourceRange & { content: string })[]): string {
  return replacements.sort((a, b) => b.start - a.start)
    .reduce((result, item) => result.slice(0, item.start) + item.content + result.slice(item.end), content);
}

/** Resolve displayed source using the current translator, retaining the original for compilation. */
export function localizeExampleSource(file: ExampleSourceFile, t: Translator): string {
  const typed = /\.tsx?$/.test(file.path);
  const labels: Record<string, string> = {};
  let tableName = 'exampleLabels';
  while (file.content.includes(tableName)) tableName += '_';
  const render = (value: TranslationExpression): string => {
    switch (value.kind) {
      case 'text': return JSON.stringify(t(value.key));
      case 'conditional': return `(${value.test} ? ${render(value.consequent)} : ${render(value.alternate)})`;
      case 'object': return `(${replaceRanges(value.expression, value.values.map(item => ({
        ...item, content: JSON.stringify(t(item.key)),
      })))})`;
      case 'lookup': {
        if (!value.keys.length) return `(${value.expression})`;
        value.keys.forEach(key => { labels[key] = t(key); });
        // Evaluate dynamic state once; share its labels rather than repeating a dictionary per call.
        return `((key${typed ? ': string' : ''}) => ${tableName}[key] ?? key)(${value.expression})`;
      }
      default: return '';
    }
  };
  const content = replaceRanges(file.content, (file.translations || []).map(item => ({
    ...item, content: render(item.value),
  })));
  if (!Object.keys(labels).length) return content;
  return `const ${tableName}${typed ? ': Record<string, string>' : ''} = ${JSON.stringify(labels, null, 2)};\n\n${content}`;
}

export interface ExampleSourceWorkspace {
  entry: string;
  files: ExampleSourceFile[];
  dependencies?: { path: string; content: string }[];
}

type ExampleSourceManifest = Record<string, ExampleSourceWorkspace>;
let sourceManifestRequest: Promise<ExampleSourceManifest> | undefined;

/** Share the original manifest between the viewer and Playground. */
export function loadExampleSources(): Promise<ExampleSourceManifest> {
  if (!sourceManifestRequest) {
    const url = new URL('playground/examples.json', document.baseURI).toString();
    sourceManifestRequest = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Unable to load example sources (${response.status})`);
      return response.json() as Promise<ExampleSourceManifest>;
    }).catch(error => {
      sourceManifestRequest = undefined;
      throw error;
    });
  }
  return sourceManifestRequest;
}
