declare class RouterCache {
    constructor();
    create(data: any, id?: number): string;
    flush(seed: any): any;
}
declare const routeCache: RouterCache;
export default routeCache;
