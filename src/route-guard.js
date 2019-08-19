import React, { lazy } from 'react';

const ForwardRefMeth = React.forwardRef(() => null);
export const REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;

const LazyMeth = lazy(() => {});
export const REACT_LAZY_TYPE = LazyMeth.$$typeof;

export class RouteCuards {
  constructor(guards, isComponentGuards = false) {
    this.isComponentGuards = isComponentGuards;
    this.beforeEnter = [];
    this.beforeUpdate = [];
    this.afterEnter = [];
    this.beforeLeave = [];
    this.afterLeave = [];
    this.merge(guards || {}, isComponentGuards);
  }

  merge(guards, isComponentGuards = true) {
    if (!guards) return;
    if (guards.isComponentGuards !== undefined) isComponentGuards = guards.isComponentGuards;
    Object.keys(guards).forEach(key => {
      const guardKey =  isComponentGuards ? key.replace('Route', '') : key;
      let guard = this[guardKey];
      let v = guards[key];
      if (!guard) return;
      const pushMeth = isComponentGuards ? guard.unshift : guard.push;
      if (Array.isArray(v)) pushMeth.call(guard, ...v.filter(Boolean));
      else if (v) pushMeth.call(guard, v);
    });
  }
}

export function useRouteGuards(component, guards = {}) {
  const ret = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render(props, ref) {
      return React.createElement(component, { ...props, ref });
    }
  };
  Object.defineProperty(ret, '__guards', { value: new RouteCuards(guards, true) });
  Object.defineProperty(ret, '__component', { value: component });
  return ret;
}
