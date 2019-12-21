declare function _parseQuery(query: string): any;
declare function _stringifyQuery(obj: {
    [key: string]: any;
}): string;
declare const _default: {
    _parseQuery: typeof _parseQuery;
    _stringifyQuery: typeof _stringifyQuery;
    inheritProps: boolean;
    zIndexStart: number;
    zIndexStep: number;
    readonly parseQuery: any;
    readonly stringifyQuery: any;
    routeMergeStrategie(parent: any, child: any, vm: any): any;
};
export default _default;
