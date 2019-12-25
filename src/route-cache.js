class RouterCache {

  constructor() {
    this.cached = {};
    this.seed = 0;
  }

  create(data, id = 0) {
    const key = `[route_cache_id:${id ? `[${id}]` : ''}${++this.seed}]`;
    this.cached[key] = data;
    return key;
  }

  flush(seed) {
    if (!seed) return;
    let ret = this.cached[seed];
    delete this.cached[seed];
    return ret;
  }

}
const routeCache = new RouterCache();


export default routeCache;
