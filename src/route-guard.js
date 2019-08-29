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

export function getGuardsComponent(v, useComponentClass = false) {
  if (useComponentClass && v.__componentClass) return v.__componentClass;
  while (v.__component) v = v.__component;
  return v;
}

export function useRouteGuards(component, guards = {}, componentClass, children) {
  const ret = new RouteComponentGuards();
  ret.render = function (props, ref) {
    return React.createElement(component, { ...props, ref });
  };
  Object.defineProperty(ret, '__guards', { value: guards });
  Object.defineProperty(ret, '__component', { value: component });

  if (guards.componentClass) componentClass = guards.componentClass;
  if (guards.children) children = guards.children;

  if (Array.isArray(componentClass)) {
    children = componentClass;
    componentClass = null;
  }

  if (componentClass) Object.defineProperty(ret, '__componentClass', { value: componentClass });
  if (children) Object.defineProperty(ret, '__children', { value: children });
  return ret;
}
