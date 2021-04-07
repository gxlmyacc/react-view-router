import React from 'react';
import { REACT_LAZY_TYPE } from './route-guard';
import { RouteLazyUpdater, MatchedRoute, ConfigRoute } from './types';


export class RouteLazy {

  private _ctor: React.ComponentType | Function | Promise<React.ComponentType>;

  private _result: React.ComponentType | null;

  private resolved: boolean;

  $$typeof: Symbol | number = REACT_LAZY_TYPE;

  options: Partial<any>;

  updaters: RouteLazyUpdater[] = [];

  constructor(
    ctor: React.ComponentType | Function | Promise<React.ComponentType>,
    options: Partial<any> = {}
  ) {
    this._ctor = ctor;
    this._result = null;

    this.options = options;
    this.render = this.render.bind(this);

    this.resolved = false;
    this.updaters = [];
  }

  toResolve(...args: any[]): Promise<React.ComponentType | null> {
    return new Promise(async (resolve, reject) => {
      if (this.resolved) return resolve(this._result);

      let _resolve = (v:
        (React.ComponentType)
        & EsModule) => {
        v = (v && v.__esModule) ? v.default : v;
        this.updaters.forEach(updater => v = updater(v) as any || v);
        this._result = v;
        this.resolved = true;
        resolve(v);
      };
      let component = (this._ctor as React.ComponentType).prototype instanceof React.Component
        ? this._ctor
        : this._ctor instanceof Promise
          ? await this._ctor
          : (this._ctor as Function)(...args);

      if (!component) throw new Error('component should not null!');

      if (component instanceof Promise) {
        component.then(_resolve).catch(function () { return reject(...arguments); });
      } else _resolve(component);
    });
  }

  render(props: any, ref: any) {
    if (!this.resolved || !this._result) return null;
    return React.createElement(this._result, { ...props, ref }, props.children);
  }

}

export function hasRouteLazy(route: MatchedRoute | ConfigRoute) {
  const config = route.config || route;
  if (config.components instanceof RouteLazy) return true;
  if (config.components) {
    for (let key of Object.keys(config.components)) {
      if (config.components[key] instanceof RouteLazy) return true;
    }
  }
  return false;
}

export function hasMatchedRouteLazy(matched: MatchedRoute[]) {
  return matched && matched.some(r => hasRouteLazy(r));
}

export function lazyImport(importMethod: Function, options: Partial<any> = {}) {
  return new RouteLazy(importMethod, options || {});
}
