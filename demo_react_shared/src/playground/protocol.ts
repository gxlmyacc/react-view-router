export const PLAYGROUND_COMPILE = 'react-viewplayground-compile';
export const PLAYGROUND_COMPILED = 'react-viewplayground-compiled';
export const PLAYGROUND_READY = 'react-viewplayground-ready';
export const PLAYGROUND_RUN = 'react-viewplayground-run';
export const PLAYGROUND_RESULT = 'react-viewplayground-result';

export interface CompileResponse {
  type: typeof PLAYGROUND_COMPILED;
  id: number;
  code: string;
  css: string;
  diagnostics: string[];
}

export interface RuntimeMessage {
  type: typeof PLAYGROUND_RUN;
  channel: string;
  code: string;
  css: string;
}
