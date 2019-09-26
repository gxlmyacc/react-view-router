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
    Object.defineProperty(this, 'updaters', { writable: true, value: [] });
    Object.defineProperty(this, 'toResolve', { value: this.toResolve });
  }

  toResolve(...args) {
    return new Promise((resolve, reject) => {
      let _resolve = v => {
        this.updaters.forEach(updater => v = updater(v) || v);
        this.resolved = true;
        resolve(v);
      };
      let component = this._ctor(...args);

      if (!component) throw new Error('component should not null!');

      if (component instanceof Promise) {
        component.then(c => {
          component = c.__esModule ? c.default : c;
          return _resolve(component);
        }).catch(function () { return reject(...arguments); });
      } else _resolve(component);
    });
  }

}

export function hasRouteLazy(route) {
  const config = route.config || route;
  if (config.components instanceof RouteLazy) return true;
  if (config.components) {
    for (let key of Object.keys(config.components)) {
      if (config.components[key] instanceof RouteLazy) return true;
    }
  }
  return false;
}

export function hasMatchedRouteLazy(matched) {
  return matched && matched.some(r => hasRouteLazy(r));
}

export function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}
