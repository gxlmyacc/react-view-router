import React, { useContext, useEffect, useRef, useState } from 'react';
import type { ConfigRoute, ReactAllComponentType } from './types';
import type { RouteHydrationInfo, RouteLazy, RouteLazyHydrateOptions } from './route-lazy';
import type ReactViewRouter from './router';
import {
  NavigationSignalController,
  RouteRuntimeAdapter,
  RouteRuntimeContext,
  createRouteRuntimeDescriptor,
  selectRouteRuntimeAdapter,
} from './route-runtime';
import { RouteRuntimeAdapterContext } from './route-runtime-context';

let transactionSeed = 0;

export interface BrowserRouteRendererProps {
  component: ReactAllComponentType | null;
  componentProps?: any;
  componentRef?: any;
}

export interface RouteLazyRendererProps extends Omit<BrowserRouteRendererProps, 'component'> {
  lazy: RouteLazy;
  route?: ConfigRoute;
  router?: ReactViewRouter;
  viewName?: string;
}

function getHydrateOptions(lazy: RouteLazy): RouteLazyHydrateOptions {
  return lazy.options.hydrate === true ? {} : lazy.options.hydrate as RouteLazyHydrateOptions;
}

function createHydrationError(message: string) {
  return new Error(`[react-view-router] ${message}`);
}

export function renderBrowserRoute(
  component: ReactAllComponentType | null,
  componentProps: any,
  componentRef?: any,
) {
  if (!component) return null;
  if (!componentProps) componentProps = {};
  return React.createElement(
    component as any,
    { ...componentProps, ref: componentRef },
    componentProps.children,
  );
}

export function BrowserRouteRenderer({
  component,
  componentProps,
  componentRef,
}: BrowserRouteRendererProps) {
  return renderBrowserRoute(component, componentProps, componentRef);
}


function HydratedRouteLazyRenderer({
  lazy,
  componentProps,
  componentRef,
  route,
  router,
  viewName = 'default',
}: RouteLazyRendererProps) {
  const adapterValue = useContext(RouteRuntimeAdapterContext);
  const adapters = adapterValue
    ? (Array.isArray(adapterValue) ? adapterValue : [adapterValue])
    : [];
  const hydrateOptions = getHydrateOptions(lazy);
  const canUseRuntime = lazy.shouldHydrate && Boolean(route) && adapters.length > 0;
  const [mode, setMode] = useState<'selecting' | 'runtime' | 'client' | 'error'>(
    canUseRuntime ? 'selecting' : 'client',
  );
  const [renderError, setRenderError] = useState<Error | null>(null);
  const controllerRef = useRef<NavigationSignalController | null>(null);
  const selectedRef = useRef<RouteRuntimeAdapter | null>(null);
  const contextRef = useRef<RouteRuntimeContext | null>(null);

  const descriptor = route
    ? createRouteRuntimeDescriptor(route, viewName, {
      owner: hydrateOptions.owner,
      runtime: hydrateOptions.runtime,
      container: hydrateOptions.container,
      payloadRef: hydrateOptions.payloadRef,
      checksum: hydrateOptions.checksum,
    })
    : undefined;
  const hydrationInfo: RouteHydrationInfo = { route, router, viewName, descriptor };
  let routeElement = renderBrowserRoute(
    lazy.resolvedComponent,
    componentProps,
    componentRef
  );
  if (hydrateOptions.wrapElement) routeElement = hydrateOptions.wrapElement(routeElement, hydrationInfo);

  if (descriptor) {
    if (!controllerRef.current) controllerRef.current = new NavigationSignalController();
    if (!contextRef.current || contextRef.current.descriptor.routeId !== descriptor.routeId) {
      transactionSeed += 1;
      contextRef.current = {
        descriptor,
        transaction: {
          transactionId: `route-runtime-${transactionSeed}`,
          action: 'push',
          to: (route as ConfigRoute).path,
          signal: controllerRef.current.signal,
        },
        route,
        component: routeElement,
        viewName,
      };
    } else {
      contextRef.current.route = route;
      contextRef.current.component = routeElement;
      contextRef.current.viewName = viewName;
    }
  }

  useEffect(() => {
    if (!lazy.shouldHydrate || !route) {
      setMode('client');
      return;
    }
    if (adapters.length === 0) {
      if (hydrateOptions.required) {
        const error = createHydrationError(`No runtime adapter is available for route ${route.path}`);
        hydrateOptions.onError && hydrateOptions.onError(error, hydrationInfo);
        setRenderError(error);
        setMode('error');
      } else setMode('client');
      return;
    }

    const context = contextRef.current as RouteRuntimeContext;
    let controller = controllerRef.current;
    if (!controller || controller.signal.cancelled) {
      controller = new NavigationSignalController();
      controllerRef.current = controller;
      context.transaction.signal = controller.signal;
    }
    let activated = false;
    setMode('selecting');

    selectRouteRuntimeAdapter(adapters, context)
      .then((adapter) => {
        if (controller.signal.cancelled) return null;
        if (!adapter) throw createHydrationError(`No runtime adapter accepted route ${route.path}`);
        selectedRef.current = adapter;
        return Promise.resolve(adapter.prepare && adapter.prepare(context, controller.signal))
          .then(() => {
            if (controller.signal.cancelled) {
              if (adapter.deactivate) return adapter.deactivate(context);
              return;
            }
            return adapter.activate(context);
          })
          .then(() => {
            if (controller.signal.cancelled) return;
            activated = true;
            setMode('runtime');
          });
      })
      .catch((reason) => {
        if (controller.signal.cancelled) return;
        const error = reason instanceof Error ? reason : createHydrationError(String(reason));
        hydrateOptions.onError && hydrateOptions.onError(error, hydrationInfo);
        if (hydrateOptions.required) {
          setRenderError(error);
          setMode('error');
        } else setMode('client');
      });

    return () => {
      controller.cancel('route renderer disposed');
      const adapter = selectedRef.current;
      if (activated && adapter && adapter.deactivate) adapter.deactivate(context);
      selectedRef.current = null;
    };
    // Runtime ownership changes only when the descriptor/adapter set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptor && descriptor.routeId, adapterValue, lazy]);

  useEffect(() => {
    const adapter = selectedRef.current;
    if (mode === 'runtime' && adapter && adapter.update && contextRef.current) {
      adapter.update(contextRef.current);
    }
  }, [componentProps, componentRef, mode]);

  if (mode === 'error' && renderError) throw renderError;
  if (mode === 'selecting' || mode === 'runtime') return null;
  return React.createElement(BrowserRouteRenderer, {
    component: lazy.resolvedComponent,
    componentProps,
    componentRef,
  });
}

export function RouteLazyRenderer({
  lazy,
  componentProps,
  componentRef,
  route,
  router,
  viewName = 'default',
}: RouteLazyRendererProps) {
  if (!lazy.shouldHydrate) {
    return React.createElement(BrowserRouteRenderer, {
      component: lazy.resolvedComponent,
      componentProps,
      componentRef,
    });
  }
  return React.createElement(HydratedRouteLazyRenderer, {
    lazy,
    componentProps,
    componentRef,
    route,
    router,
    viewName,
  });
}
