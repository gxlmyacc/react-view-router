declare function _parseQuery(query: any): {};
declare function _stringifyQuery(obj: any): string;
declare const _default: {
    _parseQuery: typeof _parseQuery;
    _stringifyQuery: typeof _stringifyQuery;
    inheritProps: boolean;
    zIndexStart: number;
    zIndexStep: number;
    readonly parseQuery: typeof _parseQuery;
    readonly stringifyQuery: typeof _stringifyQuery;
    routeMergeStrategie(parent: any, child: any, vm: any): any;
};
export default _default;
