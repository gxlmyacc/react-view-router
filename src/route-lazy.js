
export class RouteLazy {
  constructor(importMethod) {
    this.importMethod = importMethod;
    this.resolved = false;
    this.updater = null;
  }

  toResolve() {
    return new Promise((resolve, reject) => {
      let _resolve = v => {
        if (this.updater) v = this.updater(v) || v;
        this.resolved = true;
        resolve(v);
      };
      let component = this.importMethod();
      if (component instanceof Promise) {
        component.then(c => {
          component = c.__esModule ? c.default : c;
          return _resolve(component);
        }).catch(function () { return reject(arguments); });
      } else _resolve(component);
    });
  }
}

export async function resolveRouteLazyList(matched) {
  if (!matched) return;
  const toResolve = function (routeLazy) {
    if (!routeLazy || !(routeLazy instanceof RouteLazy)) return;
    return routeLazy.toResolve();
  };
  for (let r of matched) {
    const config = r.config;
    await toResolve(config.component, config);
    if (config.components) {
      for (let key of config.components) await toResolve(config.components[key], config);
    }
  }
}

export function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}
