import React from 'react';
import { REACT_LAZY_TYPE } from './route-guard';
import { RouteLazyUpdater } from './types';

export class RouteLazy {

  private _ctor: any
  private _result: any;
  private resolved: boolean;

  $$typeof: Symbol | number = REACT_LAZY_TYPE;
  options: any;
  updaters: RouteLazyUpdater[] = [];


  constructor(
    ctor: any,
    options?: any
  ) {
    this._ctor = ctor;
    this._result = null;

    this.options = options;
    this.render = this.render.bind(this);

    this.resolved = false;
    this.updaters = [];
  }

  toResolve(...args: any[]): Promise<React.FunctionComponent | React.ComponentClass> {
    return new Promise(async (resolve, reject) => {
      if (this.resolved) return resolve(this._result);

      let _resolve = (v:
        (React.FunctionComponent | React.ComponentClass)
        & { __esModule?: boolean; default: any }
      ) => {
        v = (v && v.__esModule) ? v.default : v;
        this.updaters.forEach(updater => v = updater(v) as any || v);
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

  render(props: object, ref: any) {
    if (!this.resolved || !this._result) return null;
    return React.createElement(this._result, { ...props, ref });
  }

}

export function hasRouteLazy(route: any) {
  const config = route.config || route;
  if (config.components instanceof RouteLazy) return true;
  if (config.components) {
    for (let key of Object.keys(config.components)) {
      if (config.components[key] instanceof RouteLazy) return true;
    }
  }
  return false;
}

export function hasMatchedRouteLazy(matched: any[]) {
  return matched && matched.some(r => hasRouteLazy(r));
}

export function lazyImport(importMethod: Function, options?: any) {
  return new RouteLazy(importMethod, options || {});
}
