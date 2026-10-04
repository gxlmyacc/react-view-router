import { Action } from './history';
import { RouteLazy } from './route-lazy';
import {
  NavigationResult,
  NavigationSignalController,
  RouteRuntimeAdapter,
  RouteRuntimeContext,
  createRouteRuntimeDescriptor,
  selectRouteRuntimeAdapter,
} from './route-runtime';
import type { MatchedRoute, Route } from './types';

let navigationTransactionSeed = 0;

export function getFrameworkRouteRuntimeTarget(route: Route) {
  for (let routeIndex = route.matched.length - 1; routeIndex >= 0; routeIndex -= 1) {
    const matched = route.matched[routeIndex];
    const components = matched.config.components;
    if (components instanceof RouteLazy) {
      const hydrate = components.options.hydrate;
      if (hydrate && typeof hydrate === 'object' && hydrate.owner === 'framework') {
        return { lazy: components, matched, viewName: 'default' };
      }
    } else if (components) {
      const viewNames = Object.keys(components);
      for (let viewIndex = 0; viewIndex < viewNames.length; viewIndex += 1) {
        const viewName = viewNames[viewIndex];
        const component = components[viewName];
        const hydrate = component instanceof RouteLazy && component.options.hydrate;
        if (hydrate && typeof hydrate === 'object' && hydrate.owner === 'framework') {
          return { lazy: component, matched, viewName };
        }
      }
    }
  }
  return null;
}

function getNavigationAction(action?: Action) {
  if (action === Action.Replace) return 'replace' as const;
  if (action === Action.Pop) return 'pop' as const;
  return 'push' as const;
}

export class RouteRuntimeNavigationGateway {

  private adapters: RouteRuntimeAdapter[] = [];

  private activeController: NavigationSignalController | null = null;

  get hasAdapters() {
    return this.adapters.length > 0;
  }

  register(adapter: RouteRuntimeAdapter) {
    if (this.adapters.indexOf(adapter) < 0) this.adapters.push(adapter);
    return () => {
      const index = this.adapters.indexOf(adapter);
      if (index >= 0) this.adapters.splice(index, 1);
    };
  }

  cancel(reason?: unknown) {
    if (this.activeController) this.activeController.cancel(reason);
    this.activeController = null;
  }

  navigate(
    route: Route,
    action?: Action,
    from?: Route | null,
    fromEvent = false,
  ): Promise<NavigationResult | null> | null {
    const isPopNavigation = fromEvent || action === Action.Pop;
    const target = getFrameworkRouteRuntimeTarget(route);
    if (!target || this.adapters.length === 0) return null;

    const adapters = isPopNavigation
      ? this.adapters.filter((adapter) => adapter.supportsPopNavigation)
      : this.adapters;
    if (adapters.length === 0) return null;

    this.cancel('superseded by a newer framework navigation');
    const controller = new NavigationSignalController();
    this.activeController = controller;
    navigationTransactionSeed += 1;

    const hydrate = target.lazy.options.hydrate as Exclude<
      typeof target.lazy.options.hydrate,
      boolean | undefined
    >;
    const transaction = {
      transactionId: `route-runtime-navigation-${navigationTransactionSeed}`,
      action: isPopNavigation ? 'pop' as const : getNavigationAction(action),
      to: route,
      from: from || undefined,
      signal: controller.signal,
    };
    const context: RouteRuntimeContext = {
      descriptor: createRouteRuntimeDescriptor(
        target.matched as MatchedRoute,
        target.viewName,
        {
          owner: 'framework',
          runtime: hydrate.runtime,
          container: hydrate.container,
          payloadRef: hydrate.payloadRef,
          checksum: hydrate.checksum,
        },
      ),
      transaction,
      route: target.matched.config,
      viewName: target.viewName,
    };

    return selectRouteRuntimeAdapter(adapters, context).then((adapter) => {
      if (!adapter || !adapter.navigate) return null;
      return Promise.resolve(adapter.navigate(transaction)).then((result) => {
        if (controller.signal.cancelled && result.status !== 'cancelled') {
          return { status: 'cancelled', reason: controller.signal.reason };
        }
        return result;
      });
    });
  }

}
