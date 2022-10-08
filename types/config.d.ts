import ReactViewRouter from './router';
import { ParseQueryProps } from './types';
declare function parseQuery(query: string, props?: ParseQueryProps): Partial<any>;
declare function stringifyQuery(obj: Partial<any> | null | undefined, prefix?: string): string;
export { parseQuery, stringifyQuery };
declare const config: {
    _parseQuery: typeof parseQuery;
    _stringifyQuery: typeof stringifyQuery;
    inheritProps: boolean;
    zIndexStart: number;
    zIndexStep: number;
    readonly parseQuery: any;
    readonly stringifyQuery: any;
    createMergeStrategie(router: ReactViewRouter): (parent: any, child: any, vm: any) => any;
};
export default config;
