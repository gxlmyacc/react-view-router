import React, { useState, useEffect, ReactNode } from 'react';
import {
  renderRoute, normalizeRoute, isFunction,
  isRouteChanged, isRoutesChanged, isPropChanged, nextTick, isMatchedRoutePropsChanged,
  getHostRouterView, warn, hasOwnProp, getRouteChildren, ignoreCatch,
} from './util';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
import {
  MatchedRoute, ConfigRoute, RouteHistoryLocation, ReactViewContainer,
  RouteBeforeGuardFn, RouteAfterGuardFn, RouterViewName, Route, CheckKeepAliveFunction, CheckKeepAliveResultFunction,
} from './types';
import { computeRootMatch } from './match-path';
import { RouterContext, RouterViewContext } from './context';
import KeepAlive, { KeepAliveRefObject } from './keep-alive';

export interface RouterViewProps extends React.HTMLAttributes<any> {
  name?: RouterViewName,
  filter?: RouterViewFilter,
  fallback?: ReactViewFallback | React.ReactNode,
  container?: ReactViewContainer,
  router?: ReactViewRouter,
  depth?: number,
  excludeProps?: string[],
  beforeEach?: RouteBeforeGuardFn,
  afterEach?: RouteAfterGuardFn,
  keepAlive?: boolean|CheckKeepAliveFunction,
  onRouteChange?: (newRoute: MatchedRoute|null, prevRoute: MatchedRoute|null) => void,
  beforeActivate?: CheckKeepAliveResultFunction,
  _updateRef?: React.RefCallback<RouterView>|null,
  [key: string]: any
}

export interface RouterViewState {
  _routerRoot: boolean,
  toRoute: Route|null,

  parent: RouterView | null,
  depth: number,
  inited: boolean,
  resolving: boolean,
  router?: ReactViewRouter,
  parentRoute: MatchedRoute | null,
  currentRoute: MatchedRoute | null,
  routes: ConfigRoute[],
  enableKeepAlive: boolean,
  renderKeepAlive: boolean|CheckKeepAliveResultFunction,
}

export interface RouterViewDefaultProps {
  excludeProps: string[];
}

export type RouterViewFilter = (route: ConfigRoute[], state: RouterViewState) => ConfigRoute[];
export type ReactViewFallback = (state: {
  parentRoute: MatchedRoute | null,
  currentRoute: MatchedRoute | null,
  toRoute: Route | null,
  inited: boolean,
  resolving: boolean,
  depth: number,
  router: ReactViewRouter|undefined,
  view: RouterViewComponent
}) => React.ReactNode;

function normalizeRouterViewProps(props: RouterViewProps) {
  if (props.beforeEach && !hasOwnProp(props.beforeEach, 'global')) props.beforeEach.global = true;
  if (props.afterEach && !hasOwnProp(props.afterEach, 'global')) props.afterEach.global = true;
}

interface KeepAliveEventObject {
  type: keyof RouterViewEvents,
  router: ReactViewRouter,
  source: RouterView,
  target: MatchedRoute,
  to: MatchedRoute|null,
  from: MatchedRoute|null,
}

export type KeepAliveChangeEvent = (event: KeepAliveEventObject) => void;

export type RouterViewEvents = {
  activate: KeepAliveChangeEvent[],
  deactivate: KeepAliveChangeEvent[],
}

export function _checkActivate(
  router: ReactViewRouter|null|undefined,
  matchedRoute: MatchedRoute|null,
  event: KeepAliveEventObject
) {
  if (!matchedRoute || !router) return;
  const path1 = router.basenameNoSlash + matchedRoute.path;
  const path2 = event.router.basenameNoSlash + event.target.path;
  return path1 === path2;
}

export function _checkDeactivate(
  router: ReactViewRouter|null|undefined,
  matchedRoute: MatchedRoute|null,
  event: KeepAliveEventObject
) {
  if (!matchedRoute || !router) return;
  const path1 = router.basenameNoSlash + matchedRoute.path;
  const path2 = event.router.basenameNoSlash + event.target.path;
  return path1.startsWith(path2);
}

class RouterView<
  P extends RouterViewProps = RouterViewProps,
  S extends RouterViewState = RouterViewState,
  SS = any,
> extends React.Component<P, S, SS> {

  static defaultProps: RouterViewDefaultProps;

  target: typeof RouterView;

  readonly isRouterViewInstance: true;

  _isMounted: boolean;

  _events: RouterViewEvents;

  protected _reactInternalFiber?: any;

  protected _reactInternals?: any;

  protected _kaRef: KeepAliveRefObject|null;

  protected _isActivate: boolean;

  constructor(props: RouterViewProps) {
    super(props as P);
    this.target = new.target;
    this.isRouterViewInstance = true;

    const router = props && props.router;
    const depth = (props && props.depth) ? Number(props.depth) : 0;
    const state: RouterViewState = {
      _routerRoot: true,
      parent: null,
      depth,
      inited: false,
      resolving: false,
      router,
      parentRoute: null,
      currentRoute: null,
      toRoute: null,
      routes: [],
      renderKeepAlive: false,
      enableKeepAlive: false,
    };
    this.state = state as S;
    this._isMounted = false;
    this._isActivate = true;
    this._kaRef = null;
    this._events = { activate: [], deactivate: [] };

    normalizeRouterViewProps(props);
  }

  get name(): string {
    const name = this.props.name;
    if (!name) return 'default';
    return name as string;
  }

  get currentRef() {
    const currentRoute = this.state.currentRoute;
    return currentRoute && currentRoute.componentInstances[this.name];
  }

  get isActivate(): boolean {
    if (!this._isActivate) return false;
    const { _routerRoot, router } = this.state;
    if (_routerRoot) {
      if (router?.basename) {
        const parent = getHostRouterView(this);
        if (parent) return parent.isActivate;
      }
    }
    return true;
  }

  _updateRef = (ref: RouterView) => {
    const { currentRoute } = this.state;
    if (currentRoute) currentRoute.componentInstances[this.name] = ref;
    if (this.props && this.props._updateRef) this.props._updateRef(ref);
    if (this._kaRef?.activeNode) this._kaRef.activeNode.instance = ref;
    // if (this._isMounted) this.setState({ currentRoute });
  };

  _updateKARef = (ref: KeepAliveRefObject) => {
    if (!ref && this._kaRef && !this.isNull(this.state.currentRoute)) {
      ref = this._kaRef;
    }
    this._kaRef = ref;
  };

  _kaActivate = (event: Parameters<KeepAliveChangeEvent>[0]) => {
    const { parentRoute, router } = this.state;
    if (_checkActivate(router, parentRoute, event)) {
      this._isActivate = true;
      this._refreshCurrentRoute();
    }
  };

  _kaDeactivate = (event: Parameters<KeepAliveChangeEvent>[0]) => {
    const { parentRoute, router } = this.state;
    if (_checkDeactivate(router, parentRoute, event)) {
      this._events.deactivate.forEach(e => ignoreCatch(e)(event));
      this._isActivate = false;
    }
  };

  _checkEnableKeepAlive() {
    const key = 'keepAlive';
    if (this._kaRef) return true;
    if (hasOwnProp(this.props, key)) return true;
    const { currentRoute, router } = this.state;
    if (hasOwnProp(currentRoute?.config, key)) return true;
    const keepAliveProps = router?.options.keepAlive;
    if (isFunction(keepAliveProps) || keepAliveProps instanceof RegExp) return true;
    return false;
  }

  _filterRoutes(routes: ConfigRoute[], state?: RouterViewState) {
    const { name, filter } = this.props;
    let ret = routes && routes.filter(r => {
      const hasName = name && name !== 'default';
      if (r.redirect || r.index) return hasName ? name === r.name : !r.name;
      return hasName
        ? (r.components && r.components[name as string])
        : r.component || (r.components && r.components.default);
    });
    if (filter) ret = filter(ret, state || this.state);
    return ret;
  }

  getMatchedRoute(route: Route|null|undefined, depth = 0) {
    const matched = route?.matched || [];
    return matched.length > depth ? matched[depth] : null;
  }

  isKeepAliveRoute(currentRoute: MatchedRoute|null, toRoute: MatchedRoute|null, router?: ReactViewRouter) {
    if (!router) router = this.state.router;
    if (!currentRoute) return false;
    const checkKeepAlive = (v?: boolean|RegExp|CheckKeepAliveFunction) => {
      if (isFunction(v)) v = v(currentRoute, toRoute, { router: router as ReactViewRouter, view: this });
      return v instanceof RegExp
        ? toRoute ? v.test(toRoute.path) : false
        : isFunction(v) ? v as CheckKeepAliveResultFunction : Boolean(v);
    };
    let keepAlive: any = currentRoute.config.keepAlive;
    if (keepAlive) return checkKeepAlive(keepAlive);
    keepAlive = this.props.keepAlive;
    if (keepAlive) return checkKeepAlive(keepAlive);
    keepAlive = router?.options.keepAlive;
    return isFunction(keepAlive) ? checkKeepAlive(keepAlive) : false;
  }

  _refreshCurrentRoute(state?: S, pendingState?: S, callback?: () => void) {
    if (!state) state = this.state;
    const router = state.router;
    if (!router) throw new Error('state.router is null!');

    const currentRoute = this.state.currentRoute;
    let toRoute = this.getMatchedRoute(router.currentRoute, state.depth);

    if (!toRoute) {
      const route = normalizeRoute({ path: '' }, state.parentRoute && state.parentRoute.config);
      toRoute = router.createMatchedRoute(
        route,
        computeRootMatch()
      );
      router.currentRoute && router.currentRoute.matched.push(toRoute);
    } else if (!toRoute || toRoute.redirect) toRoute = null;

    const isChanged = isRouteChanged(currentRoute, toRoute);
    const isMounted = this._isMounted;

    const newState: RouterViewState = {
      enableKeepAlive: this.state.enableKeepAlive || this._checkEnableKeepAlive(),
      currentRoute: toRoute
    } as any;
    if (toRoute) toRoute.viewInstances[this.name] = this;

    if (isMounted && isChanged && router.options.keepAlive) {
      const event: KeepAliveEventObject = { router, source: this, target: null, to: toRoute, from: currentRoute } as any;
      newState.renderKeepAlive = this.isKeepAliveRoute(currentRoute, toRoute, router);
      const kaRef = this._kaRef;
      if (kaRef) {
        if (newState.renderKeepAlive) {
          if (currentRoute?.path === kaRef.activeName) {
            event.target = currentRoute as MatchedRoute;
            this._events.deactivate.forEach(e => ignoreCatch(e)(event));
            const activeNode = kaRef.activeNode;
            activeNode?.instance?.componentWillUnactivate
              && ignoreCatch(activeNode.instance.componentWillUnactivate.bind(activeNode.instance))();
          }
        } else if (currentRoute) {
          kaRef.remove(currentRoute.path, toRoute?.path === currentRoute.path);
        }
        const toPath = toRoute?.path;
        if (toPath && kaRef.activeName !== toPath) {
          const toNode = kaRef.find(toPath);
          if (toNode) {
            const beforeActivate = toNode.beforeActivate
              || this.props.beforeActivate
              || router.options.beforeViewActivate;
            if (!beforeActivate || beforeActivate(currentRoute, toRoute, { view: this, router })) {
              event.target = toRoute as MatchedRoute;
              nextTick(() => {
                if (!this._isMounted) return;
                if (toNode.instance?.componentDidActivate) ignoreCatch(toNode.instance.componentDidActivate.bind(toNode.instance))();
                this._events.activate.forEach(e => ignoreCatch(e)(event));
              });
            }
          }
        }
      }
    }

    if (this.state.inited) {
      if (pendingState) Object.assign(pendingState, newState);
      else if (isMounted) {
        const { currentRef } = this;
        if (isChanged && !newState.renderKeepAlive && currentRef && router._isReactViewComponent(currentRef)) {
          currentRef._willUnmount();
        }
        try {
          this.setState(newState);
        } catch (ex) {
          console.error(ex);
        }
        const { onRouteChange } = this.props;
        if (isChanged && onRouteChange) (ignoreCatch(onRouteChange) as any)(toRoute, currentRoute);
      }
    } else if (state !== this.state) Object.assign(state, newState);
    if (isMounted) callback && callback();
    return toRoute;
  }

  _updateResolving(resolving: boolean, toRoute: Route|null = null) {
    if (!this._isMounted) return;
    this.setState({ resolving, toRoute });
  }

  _resolveFallback(): any {
    let ret = null;
    const fallback = this.props.fallback;
    if (isFunction(fallback)) {
      const { parentRoute, currentRoute, toRoute, inited, resolving, depth, router } = this.state;
      ret = fallback({
        parentRoute,
        currentRoute,
        toRoute,
        inited,
        resolving,
        depth,
        router,
        view: this
      });
    } else if (React.isValidElement(fallback)) ret = fallback;
    return ret || null;
  }

  isNull(route: any) {
    return !route || !route.path || route.subpath === '' || route.isNull;
  }

  async componentDidMount() {
    this._isMounted = true;
    if (this.state.inited) return;

    if (!this._reactInternalFiber && !this._reactInternals) return;

    const state = { ...(this.state as S) };
    let router = state.router;

    let parent = getHostRouterView(this);
    const parentRouter = parent?.state.router;
    if (router && parent) {
      if (!parentRouter || router.mode !== parentRouter.mode || !router.basename) parent = null;
    }
    if (parent) {
      state.parent = parent;
      parent._events?.activate.push(this._kaActivate);
      parent._events?.deactivate.unshift(this._kaDeactivate);
    }

    if (router && (!parent || parentRouter !== router)) {
      if (!router.isRunning) {
        warn('[RouterView]warning: router is not running.');
      }
      router.viewRoot = this;
      const pendingRoute = router.pendingRoute;
      router.pendingRoute = null;

      state.routes = this._filterRoutes(router.routes);

      const [, location] = router.history.getIndexAndLocation
        ? router.history.getIndexAndLocation()
        : [router.history.index, router.history.location];
      router._handleRouteInterceptor(
        pendingRoute || { ...(location as RouteHistoryLocation) },
        (ok, to) => {
          if (!ok) return;
          router && to && router.updateRoute(to);
          this._refreshCurrentRoute(state);
          if (isFunction(ok)) ok(true, (router as ReactViewRouter).currentRoute);
          if (this._isMounted) this.setState(Object.assign(state, { inited: this._isMounted }));
        },
        true,
      );
    } else {
      state._routerRoot = false;
      if (!parent) {
        throw new Error('[RouterView] cannot find root RouterView instance!');
      }
      if (!router) router = state.router = parent.state.router;
      state.depth = parent.state.depth + 1;
      state.parentRoute = this.getMatchedRoute(router?.currentRoute, state.depth - 1);
      state.routes = state.parentRoute
        ? this._filterRoutes(getRouteChildren(state.parentRoute.config.children, state.parentRoute.config))
        : [];
      this._refreshCurrentRoute(state);
      if (this._isMounted) this.setState(Object.assign(state, { inited: true }));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { _routerRoot, parent, router } = this.state;
    if (parent) {
      const removeEvent = (name: keyof RouterViewEvents, fn: Function) => {
        if (!(parent as any)._events) return;
        const events = (parent as any)._events[name];
        const idx = events.indexOf(fn);
        if (~idx) events.splice(idx, 1);
      };
      removeEvent('activate', this._kaActivate);
      removeEvent('deactivate', this._kaDeactivate);
    }
    _routerRoot && router && (router.viewRoot = null);
  }

  shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState) {
    if (!this._isMounted) return false;
    if (this.state.resolving !== nextState.resolving) return true;
    if (this.state.inited !== nextState.inited) return true;
    if (this.state.depth !== nextState.depth) return true;
    if (this.state.router !== nextState.router) return true;
    const router = nextState.router;
    if (isPropChanged(this.props, nextProps, (key, val, oldVal) => {
      if (key === 'fallback' && nextState.resolving) return false;
      if (key === 'keepAlive' && isFunction(val) && isFunction(oldVal)) return false;
      if (['onRouteChange', 'beforeEach', 'afterEach', 'filter', 'beforeActivate'].includes(key)) return false;
      return true;
    })) return true;
    if (isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
    if (isRoutesChanged(this.state.routes, nextState.routes)) return true;
    if (router && isMatchedRoutePropsChanged(this.state.currentRoute, router, this.name)) return true;
    return false;
  }

  static getDerivedStateFromProps(nextProps: RouterViewProps) {
    normalizeRouterViewProps(nextProps);
    return null;
  }

  getComponentProps() {
    const { children, ...props } = this.props;

    const excludeProps = this.target.defaultProps.excludeProps || RouterView.defaultProps.excludeProps || [];
    excludeProps.forEach((key: string) => delete (props as any)[key]);
    return {
      props,
      children
    };
  }

  getComponent(currentRoute: MatchedRoute | null) {
    if (!currentRoute) return null;

    const { routes, router } = this.state;
    const { query = {}, params = {} } = ((router && router.currentRoute) || {});
    const { children, props } = this.getComponentProps();

    return renderRoute(
      currentRoute,
      routes,
      props,
      children,
      {
        router,
        name: this.name,
        query,
        params,
        ref: this._updateRef
      }
    );
  }

  renderCurrent(currentRoute: MatchedRoute | null) {
    if (this.isNull(currentRoute)) return this.props.children || null;
    return this.getComponent(currentRoute);
  }

  renderContainer(
    current: ReactNode|null,
    currentRoute: MatchedRoute | null,
  ): ReactNode | null {
    const { routes, router, depth } = this.state;
    let { container } = this.props;

    if (router) {
      container = router._callEvent('onViewContainer', container, {
        routes,
        route: currentRoute,
        depth,
        router,
        view: this,
      }) || container;
    }

    return container && currentRoute
      ? container(current, currentRoute, (current && (current as any).props) || this.getComponentProps(), this)
      : current;
  }

  render(): React.ReactNode {
    if (!this.state.inited) return this._resolveFallback();
    const { router } = this.state;
    if (!router) return null;

    const { currentRoute, _routerRoot, resolving, renderKeepAlive, enableKeepAlive } = this.state;
    const renderUtils = router.options.renderUtils;

    let ret = this.renderCurrent(currentRoute);

    if (enableKeepAlive && renderUtils) {
      const activeName = currentRoute ? currentRoute.path : '';
      const extra: Record<string, any> = {};
      if (isFunction(renderKeepAlive)) extra.beforeActivate = renderKeepAlive;
      ret = React.createElement<any>(KeepAlive, Object.assign({
        utils: renderUtils,
        activeName,
        anchorName: `${router.mode}:${router.basenameNoSlash}:${activeName}`,
        ref: this._updateKARef,
        extra,
      }), ret);
    }

    ret = this.renderContainer(ret, currentRoute);

    ret = React.createElement<any>(
      RouterViewContext.Provider,
      { value: this },
      ret
    );

    if (_routerRoot) {
      ret = React.createElement<any>(
        RouterContext.Provider,
        { value: router },
        ret
      );
    }

    ret = React.createElement(
      React.Fragment,
      {},
      ret,
      resolving ? this._resolveFallback() : null,
    );

    return ret;
  }

}

const RouterViewWrapper: React.ForwardRefExoticComponent<
  RouterViewProps & React.RefAttributes<RouterView>
> = React.forwardRef((props, ref) => {
  const [isRunning, setIsRunning] = useState(!props.router || props.router.isRunning);

  useEffect(
    () => {
      if (!isRunning && props.router && props.router.isRunning) {
        setIsRunning(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRunning, props.router && props.router.isRunning]
  );

  return isRunning ? React.createElement(RouterView, {
    ...props,
    _updateRef: ref && (isFunction(ref) ? ref : (r: RouterView) => (ref.current as any) = r)
  }) : null;
});

RouterView.defaultProps = {
  excludeProps: [
    '_updateRef',
    'name',
    'filter',
    'fallback',
    'container',
    'router',
    'depth',
    'excludeProps',
    'beforeEach',
    'afterEach',
    'onRouteChange',
    'keepAlive',
  ]
};

export {
  RouterViewWrapper,
  RouterView as RouterViewComponent
};

export default RouterViewWrapper;
