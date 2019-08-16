import React from 'react';

const ForwardRefMeth = React.forwardRef(() => null);
export const REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;

export class RouteCuards {
  constructor(guards) {
    this.beforeRouteEnter = [];
    this.beforeRouteUpdate = [];
    this.beforeRouteLeave = [];
    this.afterRouteLeave = [];
    Object.keys(guards).forEach(key => this[key] && this[key].push(guards[key]));
  }

  merge(guards) {
    Object.keys(guards).forEach(key => {
      if (!this[key]) return;
      if (guards[key]) this[key].push(...guards[key]);
    });
  }
}

export function useRouteGuards(component, guards = {}) {
  return {
    $$typeof: ForwardRefMeth.$$typeof,
    __guards: new RouteCuards(guards || {}),
    __component: component,
    render(props, ref) {
      return React.createElement(component, { ...props, ref });
    }
  };
}
