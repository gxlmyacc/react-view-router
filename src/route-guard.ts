import React, { lazy } from 'react';

const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
export const REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

interface UseRouteGuardsInfo {
  componentClass?: React.FunctionComponent | React.ComponentClass,
  children?: any,

  beforeRouteEnter?(to: any, from: any, next: Function): void,
  beforeRouteLeave?(to: any, from: any, next: Function): void,
  afterRouteEnter?(to: any, from: any): void,
  afterRouteLeave?(to: any, from: any): void,
  beforeRouteUpdate?(to: any, from: any): void,
}

export class RouteComponentGuards {

  $$typeof: Symbol | number;
  render: Function | null;

  __guards?: UseRouteGuardsInfo;
  __component?: React.FunctionComponent | React.ComponentClass | RouteComponentGuards;
  __componentClass?: React.FunctionComponent | React.ComponentClass;
  __children?: any;

  constructor() {
    this.$$typeof = REACT_FORWARD_REF_TYPE;
    this.render = null;
  }

}


export function getGuardsComponent(v: RouteComponentGuards, useComponentClass = false) {
  if (useComponentClass && v.__componentClass) return v.__componentClass;
  while (v.__component) v = v.__component as RouteComponentGuards;
  return v;
}

export function useRouteGuards(
  component: React.FunctionComponent | React.ComponentClass,
  guards: UseRouteGuardsInfo = {},
  componentClass?: React.FunctionComponent | React.ComponentClass | null,
  children?: any
  ) {
  const ret = new RouteComponentGuards();
  ret.render = function (props: any, ref: any) {
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
