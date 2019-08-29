import { REACT_LAZY_TYPE } from './route-guard';

export class RouteLazy {
  constructor(ctor) {
    this.$$typeof = REACT_LAZY_TYPE;
    this._ctor = ctor;
    this._status = -1;
    this._result = null;

    this.defaultProps = undefined;
    this.propTypes = undefined;

    Object.defineProperty(this, 'resolved', { writable: true, value: false });
    Object.defineProperty(this, 'updater', { writable: true, value: null });
    Object.defineProperty(this, 'toResolve', { value: this.toResolve });
  }

  toResolve(...args) {
    return new Promise((resolve, reject) => {
      let _resolve = v => {
        if (this.updater) v = this.updater(v) || v;
        this.resolved = true;
        resolve(v);
      };
      let component = this._ctor(...args);
      if (component instanceof Promise) {
        component.then(c => {
          component = c.__esModule ? c.default : c;
          return _resolve(component);
        }).catch(function () { return reject(...arguments); });
      } else _resolve(component);
    });
  }
}

export async function resolveRouteLazyList(matched) {
  let changed = false;
  if (!matched) return changed;
  const toResolve = async function (routeLazy, route) {
    if (!routeLazy || !(routeLazy instanceof RouteLazy)) return;
    changed = true;
    return routeLazy.toResolve(route);
  };
  for (let r of matched) {
    const config = r.config;
    await toResolve(config.component, config);
    if (config.components) {
      for (let key of Object.keys(config.components)) await toResolve(config.components[key], config);
    }
  }
  return changed;
}

export function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}
