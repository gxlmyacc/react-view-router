import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import ReactViewRouter, { HistoryType } from '../src';
import RouterView, { RouterViewComponent } from '../src/router-view';
import defaultRenderUtils from '../src/render-utils';
import fullRenderUtils from '../dom/src';
import ViewPosition from '../src/view-position';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from './helpers/test-utils';

describe('default renderUtils', () => {
  beforeEach(() => { sessionStorage.clear(); document.body.scrollTop = 0; document.body.scrollLeft = 0; });

  it('uses defaults only when omitted, including restart without replacing custom adapters', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    expect(router.options.renderUtils).toBe(defaultRenderUtils);
    const custom = { position: { getPosition: jest.fn(() => ({ x: 0, y: 1 })) } };
    router.start({ renderUtils: custom });
    expect(router.options.renderUtils).toBe(custom);
    router.start();
    expect(router.options.renderUtils).toBe(custom);
    expect(router.options.renderUtils?.position?.setPosition).toBeUndefined();
    expect(router.options.renderUtils?.storage).toBeUndefined();
    router.stop();
  });

  it('exposes only grouped methods and shares default groups with the complete adapter', () => {
    expect(Object.keys(fullRenderUtils).sort()).toEqual(['document', 'node', 'position', 'reactDOM', 'storage']);
    expect(fullRenderUtils.position).toBe(defaultRenderUtils.position);
    expect(fullRenderUtils.storage).toBe(defaultRenderUtils.storage);
    expect(fullRenderUtils.document).toBe(defaultRenderUtils.document);
    expect(fullRenderUtils.node).toBe(defaultRenderUtils.node);
    expect((fullRenderUtils as any).getPosition).toBeUndefined();
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      keepAlive: true,
      renderUtils: {
        reactDOM: { createPortal: fullRenderUtils.reactDOM.createPortal },
        document: {
          createElement: fullRenderUtils.document.createElement,
          createDocumentFragment: fullRenderUtils.document.createDocumentFragment,
        },
        node: { appendChild: fullRenderUtils.node.appendChild, insertBefore: fullRenderUtils.node.insertBefore },
      },
    });
    router.stop();
  });

  it.each([true, '.scroll', '.global-scroll', 'body'])('saves and restores with the default adapter and setting %s', async (setting) => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { savePosition: setting === 'body' ? true : setting } },
      { path: '/about', component: About },
    ], { renderUtils: undefined });
    syncNavigate(router, '/');
    const container = document.createElement('div');
    const target = document.createElement('div');
    target.className = setting === '.global-scroll' ? 'global-scroll' : 'scroll';
    container.appendChild(target);
    if (setting === '.global-scroll') document.body.appendChild(container);
    const element = setting === 'body' ? document.body : setting === true ? container : target;
    element.scrollTop = 137;
    const view = renderWithRouter(<RouterView router={router}
      getContainerRef={setting === '.global-scroll' || setting === 'body' ? undefined : () => container} />, router);
    try {
      await screen.findByTestId('home');
      await act(async () => { await router.push('/about'); });
      element.scrollTop = 0;
      act(() => { router.back(); });
      await waitFor(() => expect(element.scrollTop).toBe(137));
    } finally { view.unmount(); container.remove(); router.stop(); }
  });

  it('uses body for all settings but never overrides an explicit getter or custom adapter', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const position = new ViewPosition();
    const from = { path: '/a', action: 'POP', metaComputed: { savePosition: true }, params: {}, query: {} } as any;
    const to = { path: '/b', action: 'PUSH', metaComputed: {}, params: {}, query: {} } as any;
    const save = (props: any = {}) => position.save(router, props, 'default', 0, { to, from });
    const restore = (props: any = {}) => position.restore(router, props, 'default', 0, { to: from, from: to });
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      document.body.scrollTop = 49;
      save();
      document.body.scrollTop = 0;
      restore({ getContainerRef: () => null });
      expect(document.body.scrollTop).toBe(0);
      router.options.renderUtils = {
        position: {
          getPosition: defaultRenderUtils.position.getPosition,
          setPosition: defaultRenderUtils.position.setPosition,
        }
      };
      save(); restore();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('getDefaultPositionContainer is missing'));
      router.options.renderUtils = defaultRenderUtils;
      restore();
      expect(document.body.scrollTop).toBe(49);
      const select = jest.fn(() => document.body);
      from.metaComputed.savePosition = select;
      save(); restore();
      expect(select).toHaveBeenCalledWith(document.body, expect.objectContaining({ type: 'leave' }));
      expect(select).toHaveBeenCalledWith(document.body, expect.objectContaining({ type: 'enter' }));
      from.metaComputed.savePosition = false;
      const read = jest.fn(() => ({ y: 25 }));
      const write = jest.fn();
      save({ onSavePosition: read });
      restore({ onScrollToPosition: write });
      expect(read).toHaveBeenCalledWith(document.body, { to, from });
      expect(write).toHaveBeenCalledWith(document.body, { y: 25 });
    } finally { document.body.scrollTop = 0; router.stop(); warn.mockRestore(); }
  });

  it('maps body offsets to the real page scroll root and preserves container fallback for missing selectors', () => {
    const descriptor = Object.getOwnPropertyDescriptor(document, 'scrollingElement');
    Object.defineProperty(document, 'scrollingElement', { configurable: true, value: document.documentElement });
    try {
      expect(defaultRenderUtils.position.getDefaultPositionContainer!()).toBe(document.body);
      document.documentElement.scrollTop = 72;
      expect(defaultRenderUtils.position.getPosition!(document.body)).toEqual({ x: 0, y: 72 });
      defaultRenderUtils.position.setPosition!(document.body, { y: 35 });
      expect(document.documentElement.scrollTop).toBe(35);
      expect(defaultRenderUtils.position.queryPositionTarget!(document.body, '.missing')).toBeNull();
      const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
      const position = new ViewPosition();
      const from = { path: '/a', action: 'POP', metaComputed: { savePosition: '.missing' }, params: {}, query: {} } as any;
      const to = { path: '/b', action: 'PUSH', metaComputed: {}, params: {}, query: {} } as any;
      position.save(router, {}, 'default', 0, { to, from });
      document.documentElement.scrollTop = 0;
      position.restore(router, {}, 'default', 0, { to: from, from: to });
      expect(document.documentElement.scrollTop).toBe(35);
      router.stop();
    } finally {
      document.documentElement.scrollTop = 0;
      if (descriptor) Object.defineProperty(document, 'scrollingElement', descriptor);
      else delete (document as any).scrollingElement;
    }
  });

  it('handles browser node operations and zero offsets without ReactDOM', () => {
    const parent = defaultRenderUtils.document.createElement('div');
    const text = document.createTextNode('text');
    const comment = defaultRenderUtils.document.createComment('anchor');
    defaultRenderUtils.node.appendChild(parent, text);
    defaultRenderUtils.node.insertBefore(parent, comment, text);
    const replacement = defaultRenderUtils.document.createElement('span');
    defaultRenderUtils.node.replaceChild(parent, replacement, text);
    defaultRenderUtils.node.replaceWith(replacement, 'replacement');
    defaultRenderUtils.node.removeChild(parent, comment);
    defaultRenderUtils.node.remove(parent.firstChild! as ChildNode);
    expect(parent.childNodes.length).toBe(0);
    expect(defaultRenderUtils.document.createDocumentFragment().nodeType).toBe(11);
    const container = document.createElement('div');
    container.scrollTop = 10;
    defaultRenderUtils.position.setPosition!(container, {});
    expect(defaultRenderUtils.position.getPosition!(container)).toEqual({ x: 0, y: 0 });
    const scrollTo = jest.fn();
    container.scrollTo = scrollTo;
    defaultRenderUtils.position.setPosition!(container, { x: 12, y: 34 });
    expect(scrollTo).toHaveBeenCalledWith(12, 34);
    defaultRenderUtils.position.setPosition!(container, {});
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    expect((defaultRenderUtils as any).reactDOM?.createPortal).toBeUndefined();
    expect(fullRenderUtils.reactDOM.createPortal).toEqual(expect.any(Function));
  });

  it('returns null when session storage access is denied', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage')!;
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => { throw new Error('denied'); } });
    try { expect(defaultRenderUtils.storage.getSessionStorage!()).toBeNull(); } finally {
      Object.defineProperty(window, 'sessionStorage', descriptor);
    }
  });

  it('retains zero positions in an isolated router cache when storage is denied', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage')!;
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => { throw new Error('denied'); } });
    const first = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const second = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    const position = new ViewPosition();
    const container = document.createElement('div');
    const props = { getContainerRef: () => container };
    const from = { path: '/a', action: 'POP', metaComputed: { savePosition: true }, params: {}, query: {} } as any;
    const to = { path: '/b', action: 'PUSH', metaComputed: {}, params: {}, query: {} } as any;
    try {
      position.save(first, props, 'default', 0, { to, from });
      container.scrollTop = 55;
      position.restore(second, props, 'default', 0, { to: from, from: to });
      expect(container.scrollTop).toBe(55);
      position.restore(first, props, 'default', 0, { to: from, from: to });
      expect(container.scrollTop).toBe(0);
      container.scrollTop = 66;
      position.restore(first, props, 'default', 0, { to: from, from: to });
      expect(container.scrollTop).toBe(66);
    } finally {
      Object.defineProperty(window, 'sessionStorage', descriptor);
      first.stop(); second.stop();
    }
  });

  it('validates router, route and view KeepAlive capabilities but accepts the complete adapter', () => {
    const base = { manual: true, mode: HistoryType.memory };
    expect(() => new ReactViewRouter({ ...base, keepAlive: true })).toThrow('createPortal');
    expect(() => new ReactViewRouter({ ...base, routes: [{ path: '/', keepAlive: true }] })).toThrow('createPortal');
    const router = new ReactViewRouter(base);
    const view = new RouterViewComponent({ router, keepAlive: true });
    Object.assign(view.state, { inited: true, enableKeepAlive: true });
    expect(() => view.render()).toThrow('createPortal');
    expect(() => new ReactViewRouter({
      ...base, keepAlive: true, renderUtils: { reactDOM: { createPortal: fullRenderUtils.reactDOM.createPortal } },
    })).toThrow('document.createElement, document.createDocumentFragment, node.appendChild, node.insertBefore');
    expect(() => new ReactViewRouter({ ...base, keepAlive: true, renderUtils: fullRenderUtils })).not.toThrow();
    router.stop();
  });
});
