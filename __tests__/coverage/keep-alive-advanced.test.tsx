import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import KeepAlive from '../../src/keep-alive';
import { renderUtils } from '../helpers/test-utils';

describe('KeepAlive 深度覆盖', () => {
  it('remove triggerRender 为 false 不应触发重渲染', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/nr',
        ref,
        children: React.createElement('div', { 'data-testid': 'nr' }, 'nr'),
      }),
    );
    await screen.findByTestId('nr');
    const lenBefore = ref.current.nodes.length;
    act(() => ref.current.remove('/nr', false));
    expect(ref.current.nodes.length).toBe(lenBefore - 1);
  });

  it('remove 默认触发更新，不存在的 name 返回 -1', async () => {
    const ref = React.createRef<any>();
    render(React.createElement(KeepAlive, {
      utils: renderUtils,
      activeName: '/remove',
      ref,
      children: React.createElement('div', { 'data-testid': 'remove' }, 'remove'),
    }));
    await screen.findByTestId('remove');
    act(() => expect(ref.current.remove('/absent')).toBe(-1));
    act(() => expect(ref.current.remove('/remove')).toBe(0));
    expect(ref.current.find('/remove')).toBeUndefined();
  });

  it('外部 anchor ref 可作为初始锚点并初始化 ready 标记', async () => {
    const ref = React.createRef<any>();
    const anchorRef = { current: document.createElement('div') } as React.RefObject<any>;
    render(React.createElement(KeepAlive, {
      utils: renderUtils,
      activeName: '/external-anchor',
      anchorRef,
      ref,
      children: React.createElement('div', { 'data-testid': 'external-anchor' }, 'child'),
    }));
    await screen.findByTestId('external-anchor');
    expect(ref.current.current).toBe(anchorRef.current);
    expect(ref.current.ready).toBe(1);
  });

  it('children 为 null 时应移除节点', async () => {
    const ref = React.createRef<any>();
    const { rerender } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/null',
        ref,
        children: React.createElement('div', { 'data-testid': 'null-child' }, 'n'),
      }),
    );
    await screen.findByTestId('null-child');
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/null',
        ref,
        children: null,
      }),
    );
    expect(ref.current.find('/null')).toBeUndefined();
  });

  it('extra 应合并到节点', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/ex',
        ref,
        extra: { tag: 'x' },
        children: React.createElement('div', { 'data-testid': 'ex' }, 'ex'),
      }),
    );
    await screen.findByTestId('ex');
    expect(ref.current.find('/ex')?.tag).toBe('x');
  });

  it('children 更新应刷新节点内容', async () => {
    const ref = React.createRef<any>();
    const { rerender } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/upd',
        ref,
        children: React.createElement('div', { 'data-testid': 'v1' }, 'v1'),
      }),
    );
    await screen.findByTestId('v1');
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/upd',
        ref,
        children: React.createElement('div', { 'data-testid': 'v2' }, 'v2'),
      }),
    );
    expect(ref.current.find('/upd')?.node).toBeTruthy();
  });

  it('anchorName 更新应刷新 anchor 文本', async () => {
    const ref = React.createRef<any>();
    const { rerender } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/named',
        anchorName: 'slot-a',
        ref,
        children: React.createElement('div', { 'data-testid': 'named' }, 'n'),
      }),
    );
    await screen.findByTestId('named');
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/named',
        anchorName: 'slot-b',
        ref,
        children: React.createElement('div', { 'data-testid': 'named' }, 'n'),
      }),
    );
    const anchor = document.querySelector('i');
    expect(anchor?.textContent).toContain('slot-b');
  });

  it('anchorName 为空时应使用默认 anchor 文本', async () => {
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/no-name',
        ref: React.createRef(),
        children: React.createElement('div', { 'data-testid': 'no-name' }, 'n'),
      }),
    );
    await screen.findByTestId('no-name');
    const anchor = document.querySelector('i');
    expect(anchor?.textContent).toBe('keep-alive-anchor');
  });

  it('切换 activeName 应缓存非激活路由', async () => {
    const ref = React.createRef<any>();
    const { rerender } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/a',
        ref,
        children: React.createElement('div', { 'data-testid': 'a' }, 'A'),
      }),
    );
    await screen.findByTestId('a');
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/b',
        ref,
        children: React.createElement('div', { 'data-testid': 'b' }, 'B'),
      }),
    );
    expect(ref.current.nodes.length).toBe(2);
    expect(ref.current.find('/a')).toBeDefined();
    expect(ref.current.find('/b')).toBeDefined();
  });
});
