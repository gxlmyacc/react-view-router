import React, { createContext } from 'react';
import { RouterContext, RouterViewContext } from '../src/context';
import { REACT_VIEW_ROUTER_GLOBAL } from '../src/global';

describe('context', () => {
  it('RouterContext 应为 React Context', () => {
    expect(RouterContext).toBeDefined();
    expect(RouterContext.Provider).toBeDefined();
    expect(RouterContext.Consumer).toBeDefined();
  });

  it('RouterViewContext 应为 React Context', () => {
    expect(RouterViewContext).toBeDefined();
    expect(RouterViewContext.Provider).toBeDefined();
  });

  it('全局已注册 Context 时不应重复创建', () => {
    jest.isolateModules(() => {
      const ReactMod = require('react');
      const { REACT_VIEW_ROUTER_GLOBAL: g } = require('../src/global');
      const existing = ReactMod.createContext(null);
      g.contexts.RouterContext = existing;
      g.contexts.RouterViewContext = existing;
      const { RouterContext: RC } = require('../src/context');
      expect(RC).toBe(existing);
    });
  });
});
