import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import KeepAlive, {
  createAnchor,
  createAnchorText,
  KEEP_ALIVE_ANCHOR,
  KEEP_ALIVE_REPLACER,
  KEEP_ALIVE_KEEP_COPIES,
} from '../src/keep-alive';
import { renderUtils } from './helpers/test-utils';

const Child = () => React.createElement('div', { 'data-testid': 'child' }, 'child content');

describe('keep-alive 常量', () => {
  it('应导出 keep-alive 相关常量', () => {
    expect(KEEP_ALIVE_ANCHOR).toBe('keep-alive-anchor');
    expect(KEEP_ALIVE_REPLACER).toBe('keep-alive-replacer');
    expect(KEEP_ALIVE_KEEP_COPIES).toBe('keep-alive-keep-copies');
  });

  it('createAnchorText 应生成锚点文本', () => {
    expect(createAnchorText('page1')).toContain(KEEP_ALIVE_ANCHOR);
    expect(createAnchorText('')).toBe(KEEP_ALIVE_ANCHOR);
  });
});

describe('KeepAlive 组件', () => {
  it('应渲染子节点并在 activeName 匹配时显示', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/page-a',
        ref,
        children: React.createElement(Child),
      }),
    );
    expect(await screen.findByTestId('child')).toBeTruthy();
    expect(ref.current).toBeTruthy();
    expect(ref.current.activeName).toBe('/page-a');
  });

  it('activeName 切换时应更新 nodes 缓存', async () => {
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
    expect(ref.current.nodes.length).toBeGreaterThan(0);
    expect(ref.current.find('/a')).toBeDefined();
    expect(ref.current.find('/b')).toBeDefined();
  });

  it('remove 应移除缓存节点', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/rm',
        ref,
        children: React.createElement(Child),
      }),
    );
    await screen.findByTestId('child');
    const idx = ref.current.remove('/rm', false);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(ref.current.nodes.length).toBe(0);
  });

  it('find 应查找缓存节点', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/find',
        ref,
        children: React.createElement(Child),
      }),
    );
    await screen.findByTestId('child');
    const node = ref.current.find('/find');
    expect(node).toBeDefined();
    expect(node.name).toBe('/find');
  });

  it('createAnchor 应创建隐藏锚点元素', () => {
    const anchorRef = React.createRef<HTMLElement>();
    const anchor = createAnchor(renderUtils, anchorRef, 'test-anchor');
    expect(anchor).toBeTruthy();
  });

  it('无 activeName 时不渲染 portal 子节点', () => {
    const { queryByTestId } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '',
        children: React.createElement(Child),
      }),
    );
    expect(queryByTestId('child')).toBeNull();
  });

  it('自定义 anchorName 应生效', async () => {
    const ref = React.createRef<any>();
    render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/an',
        anchorName: 'my-anchor',
        ref,
        children: React.createElement('div', { 'data-testid': 'an' }, 'an'),
      }),
    );
    expect(await screen.findByTestId('an')).toBeTruthy();
  });

  it('来回切换 activeName 应重新激活缓存', async () => {
    const ref = React.createRef<any>();
    const { rerender } = render(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/sw-a',
        ref,
        children: React.createElement('div', { 'data-testid': 'sw-a' }, 'A'),
      }),
    );
    await screen.findByTestId('sw-a');
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/sw-b',
        ref,
        children: React.createElement('div', { 'data-testid': 'sw-b' }, 'B'),
      }),
    );
    rerender(
      React.createElement(KeepAlive, {
        utils: renderUtils,
        activeName: '/sw-a',
        ref,
        children: React.createElement('div', { 'data-testid': 'sw-a' }, 'A'),
      }),
    );
    expect(await screen.findByTestId('sw-a')).toBeTruthy();
    expect(ref.current.nodes.length).toBeGreaterThanOrEqual(2);
  });

  it('反复切换时应保留受控输入的 React 状态', async () => {
    const StatefulInput = () => {
      const [value, setValue] = React.useState('');
      return (
        <>
          <input aria-label="cached input" value={value} onChange={(event) => setValue(event.target.value)} />
          <span data-testid="cached-length">{value.length}</span>
        </>
      );
    };
    const renderPage = (activeName: string) => React.createElement(KeepAlive, {
      utils: renderUtils,
      activeName,
      children: activeName === '/input'
        ? React.createElement(StatefulInput)
        : React.createElement('div', null, 'Other page'),
    });
    const { rerender } = render(renderPage('/input'));
    fireEvent.change(await screen.findByLabelText('cached input'), { target: { value: 'retained' } });
    expect(screen.getByTestId('cached-length').textContent).toBe('8');

    for (let index = 0; index < 2; index++) {
      rerender(renderPage('/other'));
      rerender(renderPage('/input'));
      expect(screen.getByLabelText('cached input')).toHaveValue('retained');
      expect(screen.getByTestId('cached-length').textContent).toBe('8');
    }
  });
});
