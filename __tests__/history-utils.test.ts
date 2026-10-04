import {
  createPath,
  parsePath,
  createHref,
  createEvents,
  createKey,
  clamp,
  getPossibleHashType,
  getBaseHref,
  hasOwnProp,
  copyOwnProperties,
  copyOwnProperty,
  readonly,
  allowTx,
  allowTxWithParams,
  CAN_USE_DOM,
} from '../src/history/utils';
import { Action } from '../src/history/types';

describe('history/utils', () => {
  describe('createPath / parsePath', () => {
    it('createPath 应拼接 pathname、search、hash', () => {
      expect(createPath({ pathname: '/foo', search: '?a=1', hash: '#bar' })).toBe('/foo?a=1#bar');
      expect(createPath({})).toBe('/');
    });

    it('parsePath 应解析完整路径', () => {
      expect(parsePath('/foo?a=1#bar')).toEqual({
        pathname: '/foo',
        search: '?a=1',
        hash: '#bar',
      });
    });

    it('parsePath 应处理仅有 hash 的路径', () => {
      expect(parsePath('#/home')).toEqual({ hash: '#/home' });
    });

    it('parsePath 空字符串应返回空对象', () => {
      expect(parsePath('')).toEqual({});
      expect(parsePath('relative#part')).toEqual({ pathname: '/relative', hash: '#part' });
      expect(parsePath('relative?tab=one')).toEqual({ pathname: '/relative', search: '?tab=one' });
    });
  });

  describe('createHref', () => {
    it('slash 模式应添加前导斜杠', () => {
      expect(createHref('home', 'slash')).toBe('/home');
    });

    it('noslash 模式应移除前导斜杠', () => {
      expect(createHref('/home', 'noslash')).toBe('home');
      expect(createHref('home', 'noslash')).toBe('home');
    });

    it('应保留 # 前缀', () => {
      expect(createHref('#/home', 'slash')).toBe('#/home');
      expect(createHref({ pathname: '/home' }, null as any, { location: { hash: '#/base' } } as any)).toBe('/home');
      expect(createHref('/home', 'custom' as any)).toBe('/home');
    });
  });

  describe('createEvents', () => {
    it('应注册并调用事件处理器', () => {
      const events = createEvents<(arg: string) => void>();
      const fn = jest.fn();
      const unsubscribe = events.push(fn);
      events.call('hello');
      expect(fn).toHaveBeenCalledWith('hello', undefined);
      unsubscribe();
      events.call('world');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('length 应反映处理器数量', () => {
      const events = createEvents();
      const unsub = events.push(() => {});
      expect(events.length).toBe(1);
      unsub();
      expect(events.length).toBe(0);
    });
  });

  describe('createKey', () => {
    it('应生成非空字符串', () => {
      expect(typeof createKey()).toBe('string');
      expect(createKey().length).toBeGreaterThan(0);
    });
  });

  describe('clamp', () => {
    it('应将值限制在范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('getPossibleHashType', () => {
    it('空 hash 或 / 开头应为 slash', () => {
      expect(getPossibleHashType({ location: { hash: '' } } as Window)).toBe('slash');
      expect(getPossibleHashType({ location: { hash: '#/' } } as Window)).toBe('slash');
    });

    it('非斜杠开头应为 noslash', () => {
      expect(getPossibleHashType({ location: { hash: '#home' } } as Window)).toBe('noslash');
      expect(getPossibleHashType()).toBe('slash');
      expect(getPossibleHashType({ location: { hash: '#/fallback' } } as Window, 'plain')).toBe('slash');
    });
  });

  describe('hasOwnProp / copyOwnProperties', () => {
    it('hasOwnProp 应检测自有属性', () => {
      expect(hasOwnProp({ a: 1 }, 'a')).toBe(true);
      expect(hasOwnProp({ a: 1 }, 'b')).toBe(false);
      expect(hasOwnProp(null, 'a')).toBe(false);
    });

    it('copyOwnProperties 应复制属性', () => {
      const target = { a: 1 };
      const source = { b: 2, a: 3 };
      copyOwnProperties(target, source);
      expect(target).toEqual({ a: 1, b: 2 });
      copyOwnProperties(target, source, true);
      expect(target.a).toBe(3);
    });

    it('copyOwnProperty 应复制单个属性描述符', () => {
      const source = {};
      Object.defineProperty(source, 'x', { value: 42, enumerable: true });
      const target = {};
      copyOwnProperty(target, 'x', source);
      expect((target as any).x).toBe(42);
    });
  });

  describe('readonly', () => {
    it('应定义只读属性', () => {
      const obj: any = {};
      readonly(obj, 'val', () => 100);
      expect(obj.val).toBe(100);
      const descriptor = Object.getOwnPropertyDescriptor(obj, 'val');
      expect(descriptor?.get).toBeDefined();
      expect(descriptor?.set).toBeUndefined();
    });
  });

  describe('allowTx / allowTxWithParams', () => {
    it('无 blocker 时应允许事务', () => {
      const blockers = createEvents();
      const callback = jest.fn();
      const result = allowTx(blockers, Action.Push, {} as any, 0, 1, callback);
      expect(result).toBe(true);
    });

    it('blocker 拒绝时应调用 callback(false)', () => {
      const blockers = createEvents();
      blockers.push(({ callback }) => callback(false));
      const cb = jest.fn();
      allowTxWithParams(blockers, {
        action: Action.Push,
        location: {} as any,
        index: 0,
        nextIndex: 1,
        callback: cb,
      });
      expect(cb).toHaveBeenCalledWith(false);
    });

    it('所有 blocker 通过时应调用 callback(true)', () => {
      const blockers = createEvents();
      blockers.push(({ callback }) => callback(true));
      const cb = jest.fn();
      allowTxWithParams(blockers, {
        action: Action.Push,
        location: {} as any,
        index: 0,
        nextIndex: 1,
        callback: cb,
      });
      expect(cb).toHaveBeenCalledWith(true, undefined);
    });
  });

  describe('CAN_USE_DOM', () => {
    it('在 jsdom 环境中应为 true', () => {
      expect(CAN_USE_DOM).toBe(true);
    });
  });

  it('getBaseHref 应从 base 元素读取 href 并截掉当前 hash', () => {
    const base = document.createElement('base');
    base.href = '/app/';
    document.head.appendChild(base);
    expect(getBaseHref()).toBe(window.location.href.split('#')[0]);
    base.remove();
    expect(getBaseHref()).toBe('');
    window.history.pushState({}, '', '/base#fragment');
    document.head.appendChild(base);
    expect(getBaseHref()).toBe(window.location.href.split('#')[0]);
    base.remove();
    window.history.pushState({}, '', '/');
  });

  it('copyOwnProperty 找不到属性时返回 undefined', () => {
    expect(copyOwnProperty({}, 'missing', {})).toBeUndefined();
    expect(copyOwnProperty(null as any, 'x', {})).toBeUndefined();
    expect(copyOwnProperties({} as any, null as any)).toEqual({});
  });

  it('allowTxWithParams 等待所有 blocker 并只完成一次', () => {
    const blockers = createEvents<any>();
    const callbacks: Array<(ok: boolean, payload?: any) => void> = [];
    blockers.push(({ callback }) => callbacks.push(callback));
    blockers.push(({ callback }) => callbacks.push(callback));
    const onAllow = jest.fn();
    expect(allowTxWithParams(blockers, {
      action: Action.Push,
      location: {} as any,
      index: 0,
      nextIndex: 1,
      callback: onAllow,
    })).toBe(false);
    callbacks[0](true, 'payload');
    expect(onAllow).not.toHaveBeenCalled();
    callbacks[1](true);
    callbacks[1](true, 'ignored');
    expect(onAllow).toHaveBeenCalledTimes(1);
    expect(onAllow).toHaveBeenCalledWith(true, 'payload');
  });
});
