import { createMemoryHistory, createMemoryHref } from '../src/history/memory';
import { Action } from '../src/history/types';

describe('createMemoryHistory', () => {
  it('应使用初始条目创建历史记录', () => {
    const history = createMemoryHistory({ initialEntries: ['/home', '/about'] });
    expect(history.location.pathname).toBe('/about');
    expect(history.length).toBe(2);
    expect(history.index).toBe(1);
  });

  it('push 应添加新条目', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const listener = jest.fn();
    history.listen(listener);
    history.push('/new');
    expect(history.location.pathname).toBe('/new');
    expect(history.length).toBe(2);
    expect(listener).toHaveBeenCalled();
  });

  it('replace 应替换当前条目', () => {
    const history = createMemoryHistory({ initialEntries: ['/old'] });
    history.replace('/new');
    expect(history.location.pathname).toBe('/new');
    expect(history.length).toBe(1);
  });

  it('go 应导航到指定索引', () => {
    const history = createMemoryHistory({ initialEntries: ['/a', '/b', '/c'] });
    history.go(-1);
    expect(history.location.pathname).toBe('/b');
    expect(history.action).toBe(Action.Pop);
  });

  it('back 和 forward 应正确导航', () => {
    const history = createMemoryHistory({ initialEntries: ['/a', '/b'] });
    history.back();
    expect(history.location.pathname).toBe('/a');
    history.forward();
    expect(history.location.pathname).toBe('/b');
  });

  it('replaceState 应更新 state', () => {
    const history = createMemoryHistory();
    history.replaceState({ foo: 'bar' });
    expect(history.state).toEqual({ foo: 'bar' });
  });

  it('block 应阻止导航', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    history.block(({ callback }) => callback(false));
    history.push('/blocked');
    expect(history.location.pathname).toBe('/');
  });

  it('keeps the committed index when a back request is rejected', () => {
    const history = createMemoryHistory({ initialEntries: ['/a', '/b', '/c'] });
    const unblock = history.block(({ callback }) => callback(false));
    history.back();
    expect(history.location.pathname).toBe('/c');
    expect(history.index).toBe(2);
    unblock();
    history.back();
    expect(history.location.pathname).toBe('/b');
    expect(history.index).toBe(1);
  });

  it('createMemoryHref 应处理字符串和对象', () => {
    expect(createMemoryHref('/path')).toBe('/path');
    expect(createMemoryHref({ pathname: '/foo', search: '?a=1' })).toBe('/foo?a=1');
  });

  it('refresh 应返回当前索引和位置', () => {
    const extra = { native: true };
    const history = createMemoryHistory({ initialEntries: ['/test'], extra });
    expect(history.refresh()).toEqual([0, history.location]);
    expect(history.extra).toBe(extra);
    expect(history.createHref({ pathname: '/next', hash: '#section' })).toBe('/next#section');
    expect(history.realtimeLocation).toBe(history.location);
  });

  it('getIndexAndLocation 应返回索引和位置', () => {
    const history = createMemoryHistory({ initialEntries: ['/a', '/b'] });
    const [index, location] = history.getIndexAndLocation();
    expect(index).toBe(1);
    expect(location.pathname).toBe('/b');
  });

  it('应支持对象初始位置、显式索引和带 delta 的 replace', () => {
    const history = createMemoryHistory({
      initialEntries: [{ pathname: '/first' }, { pathname: '/second' }],
      initialIndex: 0,
    });
    history.replace({ pathname: '/moved', delta: 1 } as any);
    expect(history.index).toBe(1);
    expect(history.location.pathname).toBe('/moved');

    history.block(({ callback }) => callback(false));
    history.replace('/blocked');
    expect(history.location.pathname).toBe('/moved');
  });

  it('初始位置字段缺失时，push 使用 pathname/search/hash 默认值', () => {
    const history = createMemoryHistory({
      initialEntries: [{ pathname: undefined, search: undefined, hash: undefined } as any],
    });
    history.push('/next');
    expect(history.location).toMatchObject({ pathname: '/next', search: '', hash: '' });
  });
});
