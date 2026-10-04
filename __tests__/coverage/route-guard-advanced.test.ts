import React from 'react';
import { withRouteGuards } from '../../src/route-guard';

describe('route-guard 补充覆盖', () => {
  const Comp = () => React.createElement('div', null, 'c');

  it('componentClass 为数组时应作为 children', () => {
    const children = [{ path: '/a' }];
    const wrapped = withRouteGuards(Comp, {}, children as any);
    expect(wrapped.__children).toBe(children);
    expect(wrapped.__componentClass).toBeUndefined();
  });

  it('支持 guards 覆盖 class 与 children，并生成带 ref 的 render 函数', () => {
    const Child = () => React.createElement('span', null, 'child');
    const children = React.createElement('b', null, 'override');
    const wrapped = withRouteGuards(Comp, { componentClass: Child, children } as any);
    expect(wrapped.__componentClass).toBe(Child);
    expect(wrapped.__children).toBe(children);
    expect(wrapped.render!({ children: 'content', id: 'route' }, 'ref')).toEqual(
      React.createElement(Comp, { children: 'content', id: 'route', ref: 'ref' }, 'content'),
    );
  });

  it('空 guards 与 falsy children 不创建可选属性', () => {
    const wrapped = withRouteGuards(Comp, null as any, null, null);
    expect(wrapped.__guards).toEqual({});
    expect(wrapped.__componentClass).toBeUndefined();
    expect(wrapped.__children).toBeUndefined();
  });

  it('Symbol 不可用时仍提供 React 类型标记兼容值', () => {
    const originalSymbol = global.Symbol;
    let forwardRefType: number | undefined;
    let lazyType: number | undefined;
    try {
      jest.doMock('react', () => React);
      (global as any).Symbol = undefined;
      jest.isolateModules(() => {
        const fallbackModule = require('../../src/route-guard');
        forwardRefType = fallbackModule.REACT_FORWARD_REF_TYPE;
        lazyType = fallbackModule.REACT_LAZY_TYPE;
      });
    } finally {
      (global as any).Symbol = originalSymbol;
      jest.dontMock('react');
    }
    expect(forwardRefType).toBe(0xead0);
    expect(lazyType).toBe(0xead4);
  });
});
