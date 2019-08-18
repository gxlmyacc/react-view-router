import React, { lazy } from 'react';

const ForwardRefMeth = React.forwardRef(() => null);
export const REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;

const LazyMeth = lazy(() => {});
export const REACT_LAZY_TYPE = LazyMeth.$$typeof;

export class RouteCuards {
  constructor(guards) {
    this.beforeRouteEnter = [];
    this.beforeRouteUpdate = [];
    this.afterRouteEnter = [];
    this.beforeRouteLeave = [];
    this.afterRouteLeave = [];
    this.merge(guards || {});
  }

  merge(guards) {
    if (!guards) return;
    Object.keys(guards).forEach(key => {
      let guard = this[key];
      let v = guards[key];
      if (!guard) return;
      if (Array.isArray(v)) guard.push(...v);
      else guard.push(v);
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
  Object.defineProperty(ret, '__guards', { value: new RouteCuards(guards) });
  Object.defineProperty(ret, '__component', { value: component });
  return ret;
}
