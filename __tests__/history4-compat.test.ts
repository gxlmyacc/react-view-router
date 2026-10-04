import ReactViewRouter from '../src/router';
import { Action, HistoryType } from '../src/history';
import { getPossibleHistory, REACT_VIEW_ROUTER_GLOBAL } from '../src/history-fix';

function createHistory4(pathname = '/app/start', basename = '/app') {
  const router = new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    pathname,
  });
  router.start();
  return {
    router,
    history4: router.history.createHistory4({ basename }),
  };
}

describe('history@4.10.1 compatibility adapter', () => {
  it('exposes a decoded stable initial location and POP action', () => {
    const { router, history4 } = createHistory4();

    expect(history4.action).toBe(Action.Pop);
    expect(history4.location.pathname).toBe('/start');
    expect(history4.location).toBe(history4.location);
    expect(history4.owner).toBe(router.history);
    router.stop();
  });

  it('normalizes basename like history@4 and respects path boundaries', () => {
    const normalized = createHistory4('/app/users', 'app/');
    const basenameRoot = createHistory4('/app', '/app');
    const boundary = createHistory4('/application/users', '/app');

    expect(normalized.history4.location.pathname).toBe('/users');
    expect(basenameRoot.history4.location.pathname).toBe('/');
    expect(boundary.history4.location.pathname).toBe('/application/users');
    normalized.router.stop();
    basenameRoot.router.stop();
    boundary.router.stop();
  });

  it('encodes push/replace and reports history@4 location/action to listeners', () => {
    const { router, history4 } = createHistory4();
    const listener = jest.fn();
    const unlisten = history4.listen(listener);

    history4.push('/users', { source: 'push' });
    expect(router.history.location.pathname).toBe('/app/users');
    expect(history4.location.pathname).toBe('/users');
    expect(history4.location.state).toEqual({ source: 'push' });
    expect(history4.action).toBe(Action.Push);
    expect(listener).toHaveBeenLastCalledWith(history4.location, Action.Push);

    history4.replace({ pathname: '/account', state: { source: 'location' } });
    expect(router.history.location.pathname).toBe('/app/account');
    expect(history4.location.state).toEqual({ source: 'location' });
    expect(history4.action).toBe(Action.Replace);
    expect(listener).toHaveBeenLastCalledWith(history4.location, Action.Replace);

    unlisten();
    listener.mockClear();
    history4.push('/after-unlisten');
    expect(listener).not.toHaveBeenCalled();
    router.stop();
  });

  it('resolves query-only, hash-only, partial, and relative destinations', () => {
    const { router, history4 } = createHistory4('/app/parent/current');

    history4.push('?tab=1');
    expect(history4.location).toMatchObject({
      pathname: '/parent/current',
      search: '?tab=1',
    });

    history4.push({ hash: 'section' });
    expect(history4.location).toMatchObject({
      pathname: '/parent/current',
      hash: '#section',
    });

    history4.push({ search: 'tab=2', hash: 'details' });
    expect(history4.location).toMatchObject({ search: '?tab=2', hash: '#details' });

    history4.push('child?mode=edit#title');
    expect(history4.location.pathname).toBe('/parent/child');
    expect(history4.location).toMatchObject({ search: '?mode=edit', hash: '#title' });
    history4.push('../sibling');
    expect(history4.location.pathname).toBe('/sibling');
    history4.push('./nested/');
    expect(history4.location.pathname).toBe('/nested/');
    router.stop();
  });

  it('implements go/goBack/goForward with POP locations', () => {
    const { router, history4 } = createHistory4();
    history4.push('/first');
    history4.push('/second');
    expect(history4.length).toBe(3);

    history4.goBack();
    expect(history4.location.pathname).toBe('/first');
    expect(history4.action).toBe(Action.Pop);

    history4.goForward();
    expect(history4.location.pathname).toBe('/second');
    expect(history4.action).toBe(Action.Pop);

    history4.go(-2);
    expect(history4.location.pathname).toBe('/start');
    expect(history4.action).toBe(Action.Pop);
    router.stop();
  });

  it('creates basename hrefs with history@4 search/hash normalization', () => {
    const { router, history4 } = createHistory4();

    expect(history4.createHref({
      pathname: '/users',
      search: 'tab=1',
      hash: 'section',
    })).toBe('/app/users?tab=1#section');
    expect(history4.createHref({ pathname: 'relative' })).toBe('/apprelative');
    expect(history4.createHref({ pathname: '/users', search: '?', hash: '#' }))
      .toBe('/app/users');
    expect(history4.createHref('relative?tab=1#section'))
      .toBe('/app/relative?tab=1#section');
    expect(history4.createHref({ search: '?tab=1' })).toBe('/app/?tab=1');
    router.stop();
  });

  it('preserves location state precedence and history@4 URI errors', () => {
    const { router, history4 } = createHistory4();
    history4.push({ pathname: '/state', state: { source: 'location' } }, { source: 'argument' });
    expect(history4.location.state).toEqual({ source: 'location' });
    history4.push({ pathname: '/argument-state' }, { source: 'argument' });
    expect(history4.location.state).toEqual({ source: 'argument' });
    expect(() => history4.push('/bad%E0%A4%A')).toThrow(URIError);
    router.stop();
  });

  it('rethrows non-URI decode errors unchanged', () => {
    const { router, history4 } = createHistory4();
    const expected = new Error('decode failed');
    const decode = jest.spyOn(globalThis, 'decodeURI').mockImplementation(() => {
      throw expected;
    });
    try {
      expect(() => history4.push('/users')).toThrow(expected);
    } finally {
      decode.mockRestore();
      router.stop();
    }
  });

  it('discards a cancelled pending destination when the shared owner moves elsewhere', () => {
    const { router, history4 } = createHistory4();
    const unblock = history4.block(false);
    history4.push('/cancelled/');
    unblock();

    router.history.push('/app/external');
    expect(history4.location.pathname).toBe('/external');
    router.stop();
  });

  it('returns null when no shared or explicit history is available', () => {
    const savedHash = REACT_VIEW_ROUTER_GLOBAL.historys.hash;
    const savedBrowser = REACT_VIEW_ROUTER_GLOBAL.historys.browser;
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined as any;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined as any;
    try {
      expect(getPossibleHistory()).toBeNull();
    } finally {
      REACT_VIEW_ROUTER_GLOBAL.historys.hash = savedHash;
      REACT_VIEW_ROUTER_GLOBAL.historys.browser = savedBrowser;
    }
  });

  it('uses window.confirm by default for browser/hash-compatible prompts', () => {
    const previousConfirm = Object.getOwnPropertyDescriptor(globalThis, 'confirm');
    const confirm = jest.fn(() => false);
    Object.defineProperty(globalThis, 'confirm', { configurable: true, value: confirm });
    const { router } = createHistory4();
    Object.defineProperty(router.history, 'type', {
      configurable: true,
      value: HistoryType.browser,
    });
    const history4 = router.history.createHistory4({ basename: '/app' });
    try {
      const unblock = history4.block('Leave?');
      history4.push('/blocked-by-confirm');
      expect(confirm).toHaveBeenCalledWith('Leave?');
      expect(history4.location.pathname).toBe('/start');
      unblock();
    } finally {
      router.stop();
      if (previousConfirm) Object.defineProperty(globalThis, 'confirm', previousConfirm);
      else delete (globalThis as any).confirm;
    }
  });

  it('supports false/string/function prompts and block() defaults to false', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/app/start',
    });
    router.start();
    const confirmation = jest.fn((_message, callback) => callback(true));
    const history4 = router.history.createHistory4({
      basename: '/app',
      getUserConfirmation: confirmation,
    });

    const unblockDefault = history4.block();
    history4.push('/default-blocked');
    expect(history4.location.pathname).toBe('/start');
    unblockDefault();

    const unblockString = history4.block('Leave this page?');
    history4.push('/confirmed');
    expect(confirmation).toHaveBeenCalledWith('Leave this page?', expect.any(Function));
    expect(history4.location.pathname).toBe('/confirmed');
    unblockString();

    const unblockFunction = history4.block((_location, action) => action !== Action.Replace);
    history4.replace('/function-blocked');
    expect(history4.location.pathname).toBe('/confirmed');
    unblockFunction();
    router.stop();
  });

  it('keeps one active prompt like history@4', () => {
    const { router, history4 } = createHistory4();
    const warning = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const unblockFirst = history4.block(() => false);
    const unblockSecond = history4.block(() => true);

    history4.push('/latest-prompt-wins');
    expect(history4.location.pathname).toBe('/latest-prompt-wins');
    expect(warning).toHaveBeenCalled();

    unblockFirst();
    unblockSecond();
    warning.mockRestore();
    router.stop();
  });
});
