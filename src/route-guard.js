import React from 'react';

export class RouteComponentGuards {
  constructor(component, guards) {
    this.component = component;
    this.guards = guards;
  }

  render(props) {
    return React.createElement(this.component, props);
  }
}

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
  return new RouteComponentGuards(component, new RouteCuards(guards || {}));
}
