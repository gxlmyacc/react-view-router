import { withRouteGuards } from 'react-view-router';
import type {
  ReactAllComponentType,
  Route,
} from 'react-view-router';
import type { GuardOutcome } from '../guard-events';
import {
  emitGuardEvent,
  getGuardStore,
  isGuardBlocked,
} from '../runtime';

interface GuardedComponentOptions {
  enterInstanceCallback?: boolean;
  componentClass?: ReactAllComponentType;
}

interface GuardedComponentInstance {
  refresh?: () => void;
}

interface GuardedComponentModuleLike {
  default?: unknown;
  RouteComponentClass?: ReactAllComponentType;
}

function normalizeGuardedComponentModule(loadedModule: unknown): {
  Component: ReactAllComponentType;
  componentClass?: ReactAllComponentType;
} {
  const outerModule = loadedModule as GuardedComponentModuleLike;
  const possibleInnerModule = outerModule.default;
  const normalizedModule = possibleInnerModule
    && typeof possibleInnerModule === 'object'
    && 'default' in possibleInnerModule
    ? possibleInnerModule as GuardedComponentModuleLike
    : outerModule;
  const Component = (normalizedModule.default || normalizedModule) as ReactAllComponentType;
  return {
    Component,
    componentClass: normalizedModule.RouteComponentClass,
  };
}

export function createGuardedComponent(
  Component: ReactAllComponentType,
  name: string,
  guardOptions: GuardedComponentOptions = {},
) {
  const emit = (
    hook: string,
    to: Route,
    from: Route | null,
    outcome: GuardOutcome,
    detail = '',
  ): void => emitGuardEvent(`${name}:${hook}`, {
    scope: 'component', owner: name, hook, to, from, outcome, detail,
  });

  return withRouteGuards(Component, {
    beforeRouteEnter(to, from, next) {
      if (isGuardBlocked(name, 'beforeEnter', to, from)) {
        emit('beforeEnter', to, from, 'abort');
        next(false);
        return;
      }
      if (name === 'some' && !getGuardStore().loggedIn) {
        emit('beforeEnter', to, from, 'redirect', '/login');
        next('/login');
        return;
      }
      emit('beforeEnter', to, from, 'continue');
      next(guardOptions.enterInstanceCallback
        ? (instance: GuardedComponentInstance | null) => {
          emit('enterCallback', to, from, 'callback', instance ? 'component instance available' : 'no instance');
          if (instance && instance.refresh) instance.refresh();
        }
        : undefined);
    },
    beforeRouteResolve(to, from) {
      emit('beforeResolve', to, from, 'continue');
    },
    beforeRouteLeave(to, from, next) {
      const blocked = isGuardBlocked(name, 'beforeLeave', to, from);
      emit('beforeLeave', to, from, blocked ? 'abort' : 'continue');
      next(blocked ? false : undefined);
    },
    afterRouteLeave(to, from) {
      emit('afterLeave', to, from, 'completed');
    },
  }, guardOptions.componentClass);
}

export function loadGuardedComponent(
  loader: () => Promise<unknown>,
  name: string,
  guardOptions: GuardedComponentOptions = {},
) {
  return Promise.resolve(loader()).then((loadedModule) => {
    const { Component, componentClass } = normalizeGuardedComponentModule(loadedModule);
    return {
      __esModule: true,
      default: createGuardedComponent(Component, name, {
        ...guardOptions,
        componentClass,
      }),
    };
  });
}
