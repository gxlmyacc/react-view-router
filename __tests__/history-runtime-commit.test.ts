import { confirmInterceptors } from '../src/history-fix';
import { Action, HISTORY_PROTOCOL_VERSION, HistoryType } from '../src/history';
import ReactViewRouter from '../src/router';

function createInterceptor(result: any) {
  const onNext = jest.fn();
  const router = {
    isRunning: true,
    _hasRouteRuntimeNavigationAdapters: () => true,
    _commitRouteRuntimeNavigation: jest.fn(() => result),
  };
  return {
    onNext,
    router,
    interceptors: [{
      router,
      interceptor: (_location: any, callback: any) => callback(onNext, { path: '/framework' }),
    }] as any,
  };
}

describe('history runtime commit decision', () => {
  it('allows a legacy router without runtime-navigation methods', () => {
    const callback = jest.fn();
    const legacyRouter = { isRunning: true };
    const interceptors = [{
      router: legacyRouter,
      interceptor: (_location: any, next: any) => next(true, { path: '/legacy' }),
    }] as any;

    expect(() => confirmInterceptors(
      interceptors,
      { action: Action.Push } as any,
      callback,
    )).not.toThrow();
    expect(callback).toHaveBeenCalledWith(true, expect.any(Array));
  });

  it('marks new histories and upgrades a reused unversioned history in place', async () => {
    const creator = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    creator.start();
    const sharedHistory = creator.history;
    expect(sharedHistory.version).toBe(HISTORY_PROTOCOL_VERSION);
    creator.stop();

    delete (sharedHistory as any).version;
    if (sharedHistory._unblock) sharedHistory._unblock();
    const legacyBlocker = jest.fn(({ callback }) => callback(true));
    const legacyUnblock = sharedHistory.block(legacyBlocker);
    Object.defineProperty(sharedHistory, '_unblock', {
      configurable: true,
      value: legacyUnblock,
    });

    const consumer = new ReactViewRouter({
      manual: true,
      mode: sharedHistory,
    });
    expect(consumer.history).toBe(sharedHistory);
    expect(sharedHistory.version).toBe(HISTORY_PROTOCOL_VERSION);

    const runtimeRouter = {
      isRunning: true,
      _hasRouteRuntimeNavigationAdapters: () => true,
      _commitRouteRuntimeNavigation: jest.fn(() => Promise.resolve({ status: 'delegated' })),
    };
    const unregister = sharedHistory.interceptorTransitionTo(
      (_location: any, next: any) => next(true, { path: '/runtime' }),
      runtimeRouter as any,
    );
    sharedHistory.push('/runtime');
    await Promise.resolve();
    await Promise.resolve();
    expect(runtimeRouter._commitRouteRuntimeNavigation).toHaveBeenCalled();
    expect(sharedHistory.location.pathname).toBe('/');
    unregister();

    sharedHistory.push('/upgraded');
    expect(legacyBlocker).not.toHaveBeenCalled();
    expect(sharedHistory.location.pathname).toBe('/upgraded');
    consumer.stop();
  });

  it('applies an already-occurring POP without asking browser history to roll back', async () => {
    const fixture = createInterceptor(Promise.resolve({ status: 'committed' }));
    const callback = jest.fn();

    confirmInterceptors(fixture.interceptors, {
      action: Action.Pop,
      fromEvent: true,
    } as any, callback);
    await Promise.resolve();
    await Promise.resolve();

    expect(fixture.onNext).toHaveBeenCalledWith(true);
    expect(callback).toHaveBeenCalledWith(true, fixture.interceptors);
  });

  it('skips native push commit after framework delegation', async () => {
    const fixture = createInterceptor(Promise.resolve({ status: 'delegated' }));
    const callback = jest.fn();

    confirmInterceptors(fixture.interceptors, { action: Action.Push } as any, callback);
    await Promise.resolve();
    await Promise.resolve();

    expect(fixture.onNext).toHaveBeenCalledWith(true);
    expect(callback).toHaveBeenCalledWith(false, fixture.interceptors);
  });

  it('rejects cancelled, rejected and throwing runtime commits', async () => {
    const results = [
      () => Promise.resolve({ status: 'cancelled' }),
      () => Promise.resolve({ status: 'rejected' }),
      () => Promise.reject(new Error('framework failed')),
    ];

    for (let index = 0; index < results.length; index += 1) {
      const fixture = createInterceptor(results[index]());
      const callback = jest.fn();
      confirmInterceptors(fixture.interceptors, { action: Action.Push } as any, callback);
      await Promise.resolve();
      await Promise.resolve();
      expect(fixture.onNext).toHaveBeenCalledWith(false);
      expect(callback).toHaveBeenCalledWith(false, fixture.interceptors);
    }
  });
});
