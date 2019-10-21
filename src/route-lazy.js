import React from 'react';
import { REACT_LAZY_TYPE } from './route-guard';

export class RouteLazy {

  constructor(ctor, options) {
    this.$$typeof = REACT_LAZY_TYPE;
    this._ctor = ctor;
    this._status = -1;
    this._result = null;

    this.options = options;
    this.defaultProps = undefined;
    this.propTypes = undefined;
    this.render = this.render.bind(this);

    Object.defineProperty(this, 'resolved', { writable: true, value: false });
    Object.defineProperty(this, 'updaters', { writable: true, value: [] });
    Object.defineProperty(this, 'toResolve', { value: this.toResolve });
  }

  toResolve(...args) {
    return new Promise(async (resolve, reject) => {
      if (this.resolved) return resolve(this._result);

      let _resolve = v => {
        v = (v && v.__esModule) ? v.default : v;
        this.updaters.forEach(updater => v = updater(v) || v);
        this._result = v;
        this.resolved = true;
        resolve(v);
      };
      let component = this._ctor.prototype instanceof React.Component
        ? this._ctor
        : this._ctor instanceof Promise
          ? await this._ctor
          : this._ctor(...args);

      if (!component) throw new Error('component should not null!');

      if (component instanceof Promise) {
        component.then(_resolve).catch(function () { return reject(...arguments); });
      } else _resolve(component);
    });
  }

  render(props, ref) {
    if (!this.resolved || !this._result) return null;
    return React.createElement(this._result, { ...props, ref });
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

export function lazyImport(importMethod, options) {
  return new RouteLazy(importMethod, options || {});
}
