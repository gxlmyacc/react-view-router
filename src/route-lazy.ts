import { innumerable } from './util';
import { REACT_LAZY_TYPE } from './route-guard';
import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute, ReactAllComponentType } from './types';
import ReactViewRouter from './router';
import { renderBrowserRoute } from './route-lazy-renderer';

export type RouteHydrationMismatch = 'client-render' | 'preserve' | 'throw';

export interface RouteHydrationInfo {
  route?: ConfigRoute;
  router?: ReactViewRouter;
  viewName?: string;
  descriptor?: import('./route-runtime').RouteRuntimeDescriptor;
}

export interface RouteLazyHydrateOptions {
  required?: boolean;
  mismatch?: RouteHydrationMismatch;
  owner?: import('./route-runtime').RouteRuntimeOwner;
  runtime?: string;
  container?: string;
  payloadRef?: string;
  checksum?: string;
  wrapElement?: (element: any, info: RouteHydrationInfo) => any;
  onError?: (error: Error, info: RouteHydrationInfo) => void;
}

export type RouteLazyHydrateOption = boolean | RouteLazyHydrateOptions;

export interface RouteLazyOptions extends Partial<any> {
  hydrate?: RouteLazyHydrateOption;
}


function isEsModule(value: any): value is EsModule {
  return value && value.__esModule;
}

export class RouteLazy<P = any> {

  private _ctor: ReactAllComponentType<P> | LazyImportMethod | Promise<ReactAllComponentType<P>>;

  private _result: ReactAllComponentType<P> | null;

  private _pending: Promise<ReactAllComponentType<P>> | null;

  private resolved: boolean;

  routeLazyInstance: boolean;

  $$typeof: Symbol | number = REACT_LAZY_TYPE;

  options: RouteLazyOptions;

  updaters: RouteLazyUpdater[] = [];

  constructor(
    ctor: ReactAllComponentType<P> | LazyImportMethod<P> | Promise<ReactAllComponentType<P>>,
    options: RouteLazyOptions = {}
  ) {
    this._ctor = ctor;
    this._result = null;
    this._pending = null;

    this.routeLazyInstance = true;
    this.options = options;
    this.render = this.render.bind(this);

    this.resolved = false;
    this.updaters = [];
  }

  get isResolved() {
    return this.resolved;
  }

  get resolvedComponent() {
    return this._result;
  }

  get shouldHydrate() {
    return this.options.hydrate === true
      || Boolean(this.options.hydrate && typeof this.options.hydrate === 'object');
  }

  toResolve(router: ReactViewRouter, route: ConfigRoute, key: string): Promise<ReactAllComponentType | null> {
    if (this.resolved) return Promise.resolve(this._result);
    if (this._pending) return this._pending;

    const load = () => (
      (this._ctor as LazyImportMethod<P>).__lazyImportMethod
        ? (this._ctor as LazyImportMethod<P>)(route, key, router, this.options)
        : this._ctor as ReactAllComponentType<P>|Promise<ReactAllComponentType<P>>
    );

    const pending = Promise.resolve()
      .then(load)
      .then((loaded) => {
        let component = isEsModule(loaded) ? loaded.default : loaded;
        if (!component) throw new Error('component should not null!');

        const updaters = this.updaters.splice(0, this.updaters.length);
        updaters.forEach((updater) => {
          component = updater(component as any, router) as any || component;
        });

        this._result = component as ReactAllComponentType<P>;
        this.resolved = true;
        return this._result;
      });

    this._pending = pending.then(
      (component) => {
        this._pending = null;
        return component;
      },
      (error) => {
        this._pending = null;
        throw error;
      }
    );
    return this._pending;
  }

  render(props: any, ref: any) {
    return renderBrowserRoute(this._result, props, ref);
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
  return matched && matched.some((r) => hasRouteLazy(r));
}

export function lazyImport<P = any>(importMethod: LazyImportMethod<P>, options: RouteLazyOptions = {}) {
  innumerable(importMethod, '__lazyImportMethod', true);
  return new RouteLazy<P>(importMethod, options || {});
}

export function isRouteLazy(value: any): value is RouteLazy  {
  return value && value.routeLazyInstance;
}

export function isPromise<P = any>(value: any): value is Promise<P> {
  return value && value.then;
}
