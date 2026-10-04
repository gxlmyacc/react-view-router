import React from 'react';
import { render } from '@testing-library/react';
import { withRouter, withRoute, withRouterView, withMatchedRoute, withMatchedRouteIndex } from '../src/hocs';
import { RouterContext, RouterViewContext } from '../src/context';
import ReactViewRouter from '../src/router';
import { HistoryType } from '../src/history/types';

describe('hocs', () => {
  const Display = ({ router, route, routerView, matchedRoute, matchedRouteIndex }: any) =>
    React.createElement('div', {
      'data-router': Boolean(router),
      'data-route': Boolean(route),
      'data-view': Boolean(routerView),
      'data-matched': Boolean(matchedRoute),
      'data-index': matchedRouteIndex,
    });

  it('withRouter 应注入 router', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const Wrapped = withRouter(Display);
    const { container } = render(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-router="true"]')).toBeTruthy();
    router.stop();
  });

  it('withRoute 应注入 route', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const Wrapped = withRoute(Display);
    const { container } = render(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-route]')).toBeTruthy();
    router.stop();
  });

  it('withRouterView 应注入 routerView', () => {
    const Wrapped = withRouterView(Display);
    const mockView = { state: { depth: 1, currentRoute: null } };
    const { container } = render(
      React.createElement(
        RouterViewContext.Provider,
        { value: mockView as any },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-view="true"]')).toBeTruthy();
  });

  it('withMatchedRoute 应注入 matchedRoute', () => {
    const Wrapped = withMatchedRoute(Display, { withMatchedRouteIndex: true });
    const mockView = { state: { depth: 2, currentRoute: { path: '/x' } } };
    const { container } = render(
      React.createElement(
        RouterViewContext.Provider,
        { value: mockView as any },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-matched="true"]')).toBeTruthy();
    expect(container.querySelector('[data-index="2"]')).toBeTruthy();
  });

  it('withMatchedRouteIndex 应注入 matchedRouteIndex', () => {
    const Wrapped = withMatchedRouteIndex(Display, { withMatchedRoute: true });
    const mockView = { state: { depth: 0, currentRoute: null } };
    const { container } = render(
      React.createElement(
        RouterViewContext.Provider,
        { value: mockView as any },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-index="0"]')).toBeTruthy();
  });

  it('withMatchedRouteIndex 默认不注入 matchedRoute', () => {
    const Wrapped = withMatchedRouteIndex(Display);
    const mockView = { state: { depth: 3, currentRoute: { path: '/matched' } } };
    const { container } = render(React.createElement(
      RouterViewContext.Provider,
      { value: mockView as any },
      React.createElement(Wrapped, {}),
    ));
    expect(container.querySelector('[data-index="3"]')).toBeTruthy();
    expect(container.querySelector('[data-matched="false"]')).toBeTruthy();
  });

  it('withMatchedRoute 默认不注入 matchedRouteIndex', () => {
    const Wrapped = withMatchedRoute(Display);
    const mockView = { state: { depth: 3, currentRoute: { path: '/matched' } } };
    const { container } = render(React.createElement(
      RouterViewContext.Provider,
      { value: mockView as any },
      React.createElement(Wrapped, {}),
    ));
    expect(container.querySelector('[data-matched="true"]')).toBeTruthy();
    expect(container.querySelector('[data-index]')).toBeNull();
  });

  it('withRouter withRoute 应同时注入 route', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const Wrapped = withRouter(Display, { withRoute: true });
    const { container } = render(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-router="true"]')).toBeTruthy();
    expect(container.querySelector('[data-route="true"]')).toBeTruthy();
    router.stop();
  });

  it('withRouter 无 Provider 时 router 为 null', () => {
    const Wrapped = withRouter(Display, { withRoute: true });
    const { container } = render(React.createElement(Wrapped, {}));
    expect(container.querySelector('[data-router="false"]')).toBeTruthy();
    expect(container.querySelector('[data-route="false"]')).toBeTruthy();
  });

  it('withRoute withRouter 应同时注入 router', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    router.start();
    const Wrapped = withRoute(Display, { withRouter: true });
    const { container } = render(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(Wrapped, {}),
      ),
    );
    expect(container.querySelector('[data-router="true"]')).toBeTruthy();
    expect(container.querySelector('[data-route="true"]')).toBeTruthy();
    router.stop();
  });

  it('withRoute 无 Provider 时 route 为 null', () => {
    const Wrapped = withRoute(Display, { withRouter: true });
    const { container } = render(React.createElement(Wrapped, {}));
    expect(container.querySelector('[data-route="false"]')).toBeTruthy();
    expect(container.querySelector('[data-router="false"]')).toBeTruthy();
  });

  it('withRouterView 无 Provider 时 routerView 为 null', () => {
    const Wrapped = withRouterView(Display);
    const { container } = render(React.createElement(Wrapped, {}));
    expect(container.querySelector('[data-view="false"]')).toBeTruthy();
  });

  it('withMatchedRouteIndex 无 Provider 时 index 为 -1', () => {
    const Wrapped = withMatchedRouteIndex(Display, { withMatchedRoute: true });
    const { container } = render(React.createElement(Wrapped, {}));
    expect(container.querySelector('[data-index="-1"]')).toBeTruthy();
    expect(container.querySelector('[data-matched="false"]')).toBeTruthy();
  });

  it('withMatchedRoute 无 Provider 时 matchedRoute 为 null', () => {
    const Wrapped = withMatchedRoute(Display, { withMatchedRouteIndex: true });
    const { container } = render(React.createElement(Wrapped, {}));
    expect(container.querySelector('[data-matched="false"]')).toBeTruthy();
    expect(container.querySelector('[data-index="-1"]')).toBeTruthy();
  });
});
