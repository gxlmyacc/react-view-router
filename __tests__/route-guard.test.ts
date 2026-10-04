import React from 'react';
import {
  withRouteGuards,
  getGuardsComponent,
  RouteComponentGuards,
  REACT_FORWARD_REF_TYPE,
  REACT_LAZY_TYPE,
} from '../src/route-guard';

describe('route-guard', () => {
  const TestComponent = (props: { label?: string }) =>
    React.createElement('div', null, props.label || 'test');

  describe('withRouteGuards', () => {
    it('应包装组件并保留 guards 信息', () => {
      const guards = { beforeRouteEnter: jest.fn() };
      const wrapped = withRouteGuards(TestComponent, guards);
      expect(wrapped).toBeInstanceOf(RouteComponentGuards);
      expect(wrapped.__guards).toBe(guards);
      expect(wrapped.__component).toBe(TestComponent);
      expect(wrapped.$$typeof).toBe(REACT_FORWARD_REF_TYPE);
    });

    it('应支持 componentClass 和 children', () => {
      const ClassComp = class extends React.Component { render() { return null; } };
      const wrapped = withRouteGuards(TestComponent, { componentClass: ClassComp });
      expect(wrapped.__componentClass).toBe(ClassComp);

      const children = [{ path: '/child' }];
      const wrapped2 = withRouteGuards(TestComponent, { children });
      expect(wrapped2.__children).toBe(children);
    });

    it('render 应渲染原始组件', () => {
      const wrapped = withRouteGuards(TestComponent, {});
      const element = wrapped.render!({ label: 'hello' }, null);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('guards 为空时应使用空对象', () => {
      const wrapped = withRouteGuards(TestComponent, null as any);
      expect(wrapped.__guards).toEqual({});
    });
  });

  describe('getGuardsComponent', () => {
    it('应沿 __component 链查找最终组件', () => {
      const inner = withRouteGuards(TestComponent, {});
      const outer = withRouteGuards(inner as any, {});
      expect(getGuardsComponent(outer)).toBe(TestComponent);
    });

    it('useComponentClass 为 true 时应返回 __componentClass', () => {
      const ClassComp = () => null;
      const wrapped = withRouteGuards(TestComponent, { componentClass: ClassComp });
      expect(getGuardsComponent(wrapped, true)).toBe(ClassComp);
    });
  });

  describe('常量', () => {
    it('REACT_LAZY_TYPE 应为有效 symbol 或数字', () => {
      expect(REACT_LAZY_TYPE).toBeDefined();
    });
  });
});
