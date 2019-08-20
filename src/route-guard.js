import React, { lazy } from 'react';

const ForwardRefMeth = React.forwardRef(() => null);
export const REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;

const LazyMeth = lazy(() => {});
export const REACT_LAZY_TYPE = LazyMeth.$$typeof;

export class RouteCuards {
  constructor(guards, isComponentGuards = false) {
    this.beforeEnter = [];
    this.beforeUpdate = [];
    this.afterEnter = [];
    this.beforeLeave = [];
    this.afterLeave = [];

    Object.defineProperty(this, 'isComponentGuards', { writable: true, configurable: true, value: isComponentGuards });

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

class RouteComponentGuards {
  constructor() {
    this.$$typeof = REACT_FORWARD_REF_TYPE;
  }
}

export function useRouteGuards(component, guards = {}, componentClass) {
  const ret = new RouteComponentGuards();
  ret.render = function (props, ref) {
    return React.createElement(component, { ...props, ref });
  };
  Object.defineProperty(ret, '__guards', { value: new RouteCuards(guards, true) });
  Object.defineProperty(ret, '__component', { value: component });
  Object.defineProperty(ret, '__componentClass', { value: componentClass });
  Object.defineProperty(ret, '__resolved', { writable: true, value: false });
  return ret;
}
