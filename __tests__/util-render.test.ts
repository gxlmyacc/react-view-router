import React from 'react';
import { renderRoute, normalizeRoutes } from '../src/util';

const Home = () => React.createElement('div', null, 'home');
const About = () => React.createElement('div', null, 'about');

describe('renderRoute', () => {
  const routes = normalizeRoutes([
    { path: '/', component: Home },
    { path: '/about', component: About, props: { id: { type: String, default: '0' } } },
  ]);

  it('无路由时应返回 null', () => {
    expect(renderRoute(null, routes, {}, null)).toBeNull();
  });

  it('应渲染匹配路由组件', () => {
    const matched = { config: routes[1], path: '/about', params: { id: '1' } } as any;
    const element = renderRoute(matched, routes, {}, null, { params: { id: '1' } });
    expect(React.isValidElement(element)).toBe(true);
  });

  it('redirect 路由应返回 null', () => {
    const redirectRoutes = normalizeRoutes([
      { path: '/redir', redirect: '/about', component: Home },
    ]);
    const element = renderRoute(redirectRoutes[0], redirectRoutes, {}, null);
    expect(element).toBeNull();
  });

  it('props 为 false 时不注入属性', () => {
    const noPropRoutes = normalizeRoutes([
      { path: '/x', component: Home, props: false },
    ]);
    const element = renderRoute(noPropRoutes[0], noPropRoutes, { extra: 1 }, null);
    expect(React.isValidElement(element)).toBe(true);
  });

  it('已是 React 元素时应直接返回', () => {
    const el = React.createElement('span', null, 'direct');
    expect(renderRoute(el as any, routes, {}, null)).toBe(el);
  });
});
