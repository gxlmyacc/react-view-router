import React, { lazy } from 'react';

const ForwardRefMeth = React.forwardRef(() => null);
export const REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;

const LazyMeth = lazy(() => {});
export const REACT_LAZY_TYPE = LazyMeth.$$typeof;

class RouteComponentGuards {
  constructor() {
    this.$$typeof = REACT_FORWARD_REF_TYPE;
  }
}

export function getGuardsComponent(v) {
  while (v.__component) v = v.__component;
  return v;
}

export function useRouteGuards(component, guards = {}, componentClass) {
  const ret = new RouteComponentGuards();
  ret.render = function (props, ref) {
    return React.createElement(component, { ...props, ref });
  };
  Object.defineProperty(ret, '__guards', { value: guards });
  Object.defineProperty(ret, '__component', { value: component });
  Object.defineProperty(ret, '__componentClass', { value: componentClass });
  Object.defineProperty(ret, '__resolved', { writable: true, value: false });
  return ret;
}
