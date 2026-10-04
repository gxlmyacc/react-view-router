import React from 'react';
import { renderToString } from 'react-dom/server';
import { act, screen, waitFor } from '@testing-library/react';
import RouterView from '../src/router-view';
import ViewPosition, { SAVED_POSITION_KEY } from '../src/view-position';
import TransitionRouterView from '../transition/src/RouterView';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About, renderUtils } from './helpers/test-utils';

describe('RouterView positions', () => {
  beforeEach(() => sessionStorage.clear());

  async function push(router: ReturnType<typeof createTestRouter>, path: string) {
    await act(async () => { await router.push(path); });
  }

  it.each(['plain', 'none', 'slide', 'fade'])('%s saves before commit and restores after POP once', async (mode) => {
    const getPosition = jest.fn(renderUtils.position.getPosition);
    const setPosition = jest.fn(renderUtils.position.setPosition);
    const router = createTestRouter([
      { path: '/', component: Home, meta: { savePosition: true }, keepAlive: true },
      { path: '/about', component: About },
    ], { keepAlive: true, renderUtils: { ...renderUtils, position: { ...renderUtils.position, getPosition, setPosition } } });
    syncNavigate(router, '/');
    const container = document.createElement('div');
    container.scrollTop = 123;
    const component = mode === 'plain' ? RouterView : TransitionRouterView;
    const view = renderWithRouter(React.createElement(component as React.ElementType, {
      router, transition: mode, getContainerRef: () => container,
    }), router);
    try {
      await screen.findByTestId('home');
      expect(getPosition).not.toHaveBeenCalled();
      await push(router, '/about');
      expect(getPosition).toHaveBeenCalledTimes(1);
      container.scrollTop = 0;
      act(() => { router.back(); });
      await waitFor(() => expect(setPosition).toHaveBeenCalledTimes(1));
      expect(container.scrollTop).toBe(123);
      expect(setPosition.mock.calls[0][1]).toEqual({ x: 0, y: 123 });
    } finally { view.unmount(); router.stop(); }
  });

  it.each(['none', 'slide', 'fade'])('Transition %s supplies its own actual content container', async (transition) => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { savePosition: true } },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    const view = renderWithRouter(React.createElement(TransitionRouterView, { router, transition } as any), router);
    try {
      const home = await screen.findByTestId('home');
      const container = home.parentElement!;
      container.scrollTop = 91;
      await push(router, '/about');
      container.scrollTop = 0;
      act(() => { router.back(); });
      await waitFor(() => expect(container.scrollTop).toBe(91));
    } finally { view.unmount(); router.stop(); }
  });

  it('uses the new getter on restore and ignores prop-only updates and canceled navigation', async () => {
    const read = jest.fn(() => ({ y: 33 }));
    const write = jest.fn();
    const router = createTestRouter([
      { path: '/', component: Home, meta: { savePosition: true } },
      { path: '/about', component: About },
    ], { renderUtils: { ...renderUtils, position: { ...renderUtils.position, getPosition: read, setPosition: write } } });
    syncNavigate(router, '/');
    const first = document.createElement('div');
    const second = document.createElement('div');
    const view = renderWithRouter(React.createElement(RouterView, { router, getContainerRef: () => first }), router);
    try {
      await screen.findByTestId('home');
      view.rerender(React.createElement(RouterView, { router, getContainerRef: () => second }));
      expect(read).not.toHaveBeenCalled();
      let cancel = true;
      router.beforeEach((_to, _from, next) => next(!cancel));
      await act(async () => { await expect(router.push('/about')).rejects.toBe(false); });
      expect(read).not.toHaveBeenCalled();
      cancel = false;
      await push(router, '/about');
      expect(read).toHaveBeenCalledWith(second);
      view.rerender(React.createElement(RouterView, { router, getContainerRef: () => first }));
      act(() => { router.back(); });
      await waitFor(() => expect(write).toHaveBeenCalledWith(first, { y: 33 }));
    } finally { view.unmount(); router.stop(); }
  });

  function fixture(setting: any = true, utils: any = renderUtils) {
    const router = createTestRouter([], { renderUtils: utils });
    const from = { path: '/a', metaComputed: { savePosition: setting }, params: {}, query: {} } as any;
    const to = { path: '/b', action: 'PUSH', metaComputed: {}, params: {}, query: {} } as any;
    const container = document.createElement('div');
    const props = { getContainerRef: () => container };
    const position = new ViewPosition();
    const save = (name = 'default', depth = 0) => position.save(router, props, name, depth, { to, from });
    const restore = (name = 'default', depth = 0) => {
      from.action = 'POP';
      position.restore(router, props, name, depth, { to: from, from: to });
    };
    return { router, from, to, container, props, position, save, restore };
  }

  it('rapid navigations capture each committed route instead of restoring an obsolete target', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { savePosition: true } },
      { path: '/about', component: About, meta: { savePosition: true } },
      { path: '/third', component: About },
    ]);
    syncNavigate(router, '/');
    const container = document.createElement('div');
    const view = renderWithRouter(React.createElement(TransitionRouterView, {
      router, transition: 'slide', getContainerRef: () => container,
    }), router);
    try {
      await screen.findByTestId('home');
      container.scrollTop = 12;
      await push(router, '/about');
      container.scrollTop = 34;
      await push(router, '/third');
      container.scrollTop = 0;
      act(() => { router.back(); });
      await waitFor(() => expect(container.scrollTop).toBe(34));
      act(() => { router.back(); });
      await waitFor(() => expect(container.scrollTop).toBe(12));
    } finally { view.unmount(); router.stop(); }
  });

  it('SSR does not read containers or host storage', () => {
    const getContainerRef = jest.fn();
    const getSessionStorage = jest.fn();
    const router = createTestRouter([], { renderUtils: { ...renderUtils, storage: { ...renderUtils.storage, getSessionStorage } } });
    renderToString(React.createElement(RouterView, { router, getContainerRef }));
    expect(getContainerRef).not.toHaveBeenCalled();
    expect(getSessionStorage).not.toHaveBeenCalled();
    router.stop();
  });

  it('zero positions overwrite old records and successful restore consumes the record', () => {
    const f = fixture();
    f.container.scrollTop = 50;
    f.save();
    f.container.scrollTop = 0;
    f.save();
    f.container.scrollTop = 88;
    f.restore();
    expect(f.container.scrollTop).toBe(0);
    f.container.scrollTop = 77;
    f.restore();
    expect(f.container.scrollTop).toBe(77);
    f.router.stop();
  });

  it('ignores non-navigation, missing settings, and invalid callback positions', () => {
    const f = fixture(false, { ...renderUtils, position: { ...renderUtils.position }, storage: { ...renderUtils.storage } });
    const callback = jest.fn(() => ({ x: Number.NaN, y: 4 }));
    Object.assign(f.props, { onSavePosition: callback });
    f.to.action = 'REPLACE';
    f.save();
    expect(callback).not.toHaveBeenCalled();
    f.to.action = 'PUSH';
    f.save();
    expect(callback).toHaveBeenCalledTimes(1);
    f.from.metaComputed.savePosition = true;
    (f.router.options.renderUtils as any).position.getPosition = () => ({ x: 1, y: Number.POSITIVE_INFINITY });
    f.save();
    expect(f.container.scrollTop).toBe(0);
    f.router.stop();
  });

  it('leaves saved records intact when a position target cannot be resolved', () => {
    const utils = { ...renderUtils, position: { ...renderUtils.position }, storage: { ...renderUtils.storage } };
    const f = fixture(() => null, utils);
    f.save();
    expect(() => f.restore()).not.toThrow();
    f.from.metaComputed.savePosition = true;
    f.save();
    f.from.metaComputed.savePosition = () => null;
    expect(() => f.restore()).not.toThrow();
    f.from.metaComputed.savePosition = '.missing';
    f.router.options.renderUtils = { ...renderUtils, position: { ...renderUtils.position, queryPositionTarget: () => null } };
    f.save();
    expect(f.container.scrollTop).toBe(0);
    f.router.stop();
  });

  it('does not consume a record when the restore container is unavailable', () => {
    const f = fixture();
    f.container.scrollTop = 46;
    f.save();
    f.props.getContainerRef = () => null;
    f.restore();
    f.props.getContainerRef = () => f.container;
    f.container.scrollTop = 0;
    f.restore();
    expect(f.container.scrollTop).toBe(46);
    f.router.stop();
  });

  it('accepts empty finite positions and ignores an absent callback position', () => {
    const f = fixture(false, { ...renderUtils, position: { ...renderUtils.position }, storage: { ...renderUtils.storage } });
    const onSavePosition = jest.fn(() => undefined);
    Object.assign(f.props, { onSavePosition });
    f.save();
    expect(onSavePosition).toHaveBeenCalledTimes(1);
    Object.assign(f.props, { onSavePosition: () => ({ x: null, y: null }) });
    f.save();
    f.restore();
    expect(f.container.scrollLeft).toBe(0);
    expect(f.container.scrollTop).toBe(0);
    f.router.stop();
  });

  it('string selectors are scoped to the supplied container, with container fallback', () => {
    const f = fixture('.scroll');
    const outside = document.createElement('div');
    outside.className = 'scroll';
    document.body.appendChild(outside);
    const inside = document.createElement('div');
    inside.className = 'scroll';
    f.container.appendChild(inside);
    inside.scrollTop = 41;
    f.save();
    inside.scrollTop = 0;
    f.restore();
    expect(inside.scrollTop).toBe(41);
    expect(outside.scrollTop).toBe(0);
    inside.remove();
    f.container.scrollTop = 22;
    f.save();
    f.container.scrollTop = 0;
    f.restore();
    expect(f.container.scrollTop).toBe(22);
    outside.remove();
    f.router.stop();
  });

  it('function targets receive captured enter/leave context; callback precedence stays compatible', () => {
    const target = document.createElement('div');
    target.scrollTop = 54;
    const select = jest.fn(() => target);
    const f = fixture(select);
    const saveCallback = jest.fn(() => ({ y: 99 }));
    const restoreCallback = jest.fn();
    Object.assign(f.props, { onSavePosition: saveCallback });
    f.save();
    expect(saveCallback).not.toHaveBeenCalled();
    f.restore();
    expect(select.mock.calls.map((call: any[]) => call[1].type)).toEqual(['leave', 'enter']);
    f.save();
    Object.assign(f.props, { onScrollToPosition: restoreCallback });
    f.restore();
    expect(restoreCallback).toHaveBeenCalledWith(f.container, { x: 0, y: 54 });
    f.from.metaComputed.savePosition = false;
    f.save();
    expect(saveCallback).toHaveBeenCalledTimes(1);
    f.router.stop();
  });

  it('isolates named views and depths', () => {
    const f = fixture();
    f.container.scrollTop = 10; f.save();
    f.container.scrollTop = 20; f.save('footer');
    f.container.scrollTop = 30; f.save('default', 1);
    f.restore(); expect(f.container.scrollTop).toBe(10);
    f.restore('footer'); expect(f.container.scrollTop).toBe(20);
    f.restore('default', 1); expect(f.container.scrollTop).toBe(30);
    f.router.stop();
  });

  it.each(['absent', 'throws', 'malformed'])('supports opaque host handles with %s storage', (storageMode) => {
    const handle = { offset: 17 };
    const getSessionStorage = storageMode === 'absent' ? undefined : () => {
      if (storageMode === 'throws') throw new Error('unavailable');
      return { getItem: () => '{broken', setItem: () => { throw new Error('full'); } };
    };
    const f = fixture(true, {
      ...renderUtils,
      storage: { ...renderUtils.storage, getSessionStorage },
      position: {
        ...renderUtils.position,
        getPosition: (node: typeof handle) => ({ y: node.offset }),
        setPosition: (node: typeof handle, p: { y: number }) => { node.offset = p.y; },
      },
    });
    (f.props as any).getContainerRef = () => handle;
    f.save(); handle.offset = 0; f.restore();
    expect(handle.offset).toBe(17);
    f.router.stop();
  });

  it('uses adapter storage and loads the original storage key for a new router', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) || null, setItem: jest.fn((key, value) => values.set(key, value)) };
    const utils = { ...renderUtils, storage: { ...renderUtils.storage, getSessionStorage: () => storage } };
    const first = fixture(true, utils);
    first.container.scrollTop = 64; first.save();
    expect(storage.setItem.mock.calls[0][0]).toBe(SAVED_POSITION_KEY);
    const second = fixture(true, utils);
    second.restore(); expect(second.container.scrollTop).toBe(64);
    first.router.stop(); second.router.stop();
  });

  it.each(['getter', 'container', 'getPosition', 'setPosition', 'queryPositionTarget'])('warns once for missing %s; retains records', (missing) => {
    const utils = { ...renderUtils, position: { ...renderUtils.position }, storage: { ...renderUtils.storage } };
    const f = fixture(missing === 'queryPositionTarget' ? '.target' : true, utils);
    const warning = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      f.container.scrollTop = 39;
      f.save();
      const originalGetter = f.props.getContainerRef;
      if (missing === 'getter') {
        delete (f.props as any).getContainerRef;
        delete utils.position.getDefaultPositionContainer;
      } else if (missing === 'container') (f.props as any).getContainerRef = () => null;
      else delete (utils.position as any)[missing];
      if (missing === 'setPosition') { f.restore(); f.restore(); } else { f.save(); f.save(); }
      expect(warning).toHaveBeenCalledTimes(1);
      Object.assign(utils, renderUtils);
      f.props.getContainerRef = originalGetter;
      f.container.scrollTop = 0;
      f.restore();
      expect(f.container.scrollTop).toBe(39);
    } finally { warning.mockRestore(); f.router.stop(); }
  });
});
