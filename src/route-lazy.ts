import React from 'react';
import { innumerable } from '.';
import { REACT_LAZY_TYPE } from './route-guard';
import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute } from './types';


function isEsModule(value: any): value is EsModule {
  return value && value.__esModule;
}

export class RouteLazy<P = any> {

  private _ctor: React.ComponentType | LazyImportMethod | Promise<React.ComponentType>;

  private _result: React.ComponentType | React.ForwardRefExoticComponent<P> | null;

  private resolved: boolean;

  $$typeof: Symbol | number = REACT_LAZY_TYPE;

  options: Partial<any>;

  updaters: RouteLazyUpdater[] = [];

  constructor(
    ctor: React.ComponentType | LazyImportMethod<P> | Promise<React.ComponentType>,
    options: Partial<any> = {}
  ) {
    this._ctor = ctor;
    this._result = null;

    this.options = options;
    this.render = this.render.bind(this);

    this.resolved = false;
    this.updaters = [];
  }

  toResolve(route: ConfigRoute, key: string): Promise<React.ComponentType | null> {
    return new Promise(async (resolve, reject) => {
      if (this.resolved) return resolve(this._result as any);

      let _resolve = (v: React.ComponentType
        | React.ForwardRefExoticComponent<P>
        | EsModule<React.ComponentType | React.ForwardRefExoticComponent<P>>) => {
        v = isEsModule(v) ? v.default : v;
        this.updaters.forEach(updater => v = updater(v as any) as any || v);
        this._result = v;
        this.resolved = true;
        resolve(v as any);
      };
      let component = (this._ctor as LazyImportMethod<P>).__lazyImportMethod
        ? (this._ctor as LazyImportMethod<P>)(route, key, this.options)
        : (this._ctor as React.ComponentType|Promise<React.ComponentType>);

      try {
        component = isPromise<React.ComponentType>(component) ? await component : (component as React.ComponentType);
      } catch (ex) {
        return reject(ex);
      }
      if (!component) {
        return reject(new Error('component should not null!'));
      }

      if (component instanceof Promise) {
        component.then(_resolve).catch(function () { return reject(...arguments); });
      } else _resolve(component);
    });
  }

  render(props: any, ref: any) {
    if (!this.resolved || !this._result) return null;
    return React.createElement(this._result as any, { ...props, ref }, props.children);
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

export function lazyImport<P = any>(importMethod: LazyImportMethod<P>, options: Partial<any> = {}) {
  innumerable(importMethod, '__lazyImportMethod', true);
  return new RouteLazy<P>(importMethod, options || {});
}


export function isPromise<P = any>(value: any): value is Promise<P> {
  return value && value.then;
}
