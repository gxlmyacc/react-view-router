import React from 'react';
import { innumerable } from './util';
import { REACT_LAZY_TYPE } from './route-guard';
import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute, ReactAllComponentType } from './types';
import ReactViewRouter from './router';


function isEsModule(value: any): value is EsModule {
  return value && value.__esModule;
}

export class RouteLazy<P = any> {

  private _ctor: ReactAllComponentType<P> | LazyImportMethod | Promise<ReactAllComponentType<P>>;

  private _result: ReactAllComponentType<P> | null;

  private resolved: boolean;

  routeLazyInstance: boolean;

  $$typeof: Symbol | number = REACT_LAZY_TYPE;

  options: Partial<any>;

  updaters: RouteLazyUpdater[] = [];

  constructor(
    ctor: ReactAllComponentType<P> | LazyImportMethod<P> | Promise<ReactAllComponentType<P>>,
    options: Partial<any> = {}
  ) {
    this._ctor = ctor;
    this._result = null;

    this.routeLazyInstance = true;
    this.options = options;
    this.render = this.render.bind(this);

    this.resolved = false;
    this.updaters = [];
  }

  toResolve(router: ReactViewRouter, route: ConfigRoute, key: string): Promise<ReactAllComponentType | null> {
    return new Promise(async (resolve, reject) => {
      const _resolve = (v: ReactAllComponentType<P> | EsModule<ReactAllComponentType<P>>) => {
        v = isEsModule(v) ? v.default : v;
        const updaters = this.updaters.splice(0, this.updaters.length);
        updaters.forEach(updater => v = updater(v as any, router) as any || v);
        if (!this.resolved) {
          this._result = v;
          this.resolved = true;
        }
        resolve(v as any);
      };

      if (this.resolved) {
        _resolve(this._result as any);
        return;
      }

      let component = (this._ctor as LazyImportMethod<P>).__lazyImportMethod
        ? (this._ctor as LazyImportMethod<P>)(route, key, router, this.options)
        : (this._ctor as ReactAllComponentType<P>|Promise<ReactAllComponentType<P>>);

      try {
        component = isPromise<ReactAllComponentType<P>>(component) ? await component : (component as ReactAllComponentType<P>);
      } catch (ex) {
        reject(ex);
        return;
      }
      if (!component) {
        reject(new Error('component should not null!'));
        return;
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
    for (const key of Object.keys(config.components)) {
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

export function isRouteLazy(value: any): value is RouteLazy  {
  return value && value.routeLazyInstance;
}

export function isPromise<P = any>(value: any): value is Promise<P> {
  return value && value.then;
}
