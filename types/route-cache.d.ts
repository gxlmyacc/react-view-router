declare class RouterCache {
    private cached;
    private seed;
    constructor();
    create(data: any, id?: number): string;
    flush(seed?: string): any;
}
declare const routeCache: RouterCache;
export default routeCache;
