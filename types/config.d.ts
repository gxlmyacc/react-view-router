import ReactViewRouter from './router';
declare function _parseQuery(query: string): Partial<any>;
declare function _stringifyQuery(obj: Partial<any> | null | undefined, prefix?: string): string;
declare const _default: {
    _parseQuery: typeof _parseQuery;
    _stringifyQuery: typeof _stringifyQuery;
    inheritProps: boolean;
    zIndexStart: number;
    zIndexStep: number;
    readonly parseQuery: any;
    readonly stringifyQuery: any;
    createMergeStrategie(router: ReactViewRouter): (parent: any, child: any, vm: any) => any;
};
export default _default;
