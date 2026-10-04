import {
  NavigationSignalController,
  ROUTE_RUNTIME_PROTOCOL_VERSION,
  RouteRuntimeAdapter,
  RouteRuntimeAdapterConflictError,
  RouteRuntimeContext,
  isRouteRuntimeDescriptor,
  resolveRuntimeCompatibility,
  selectRouteRuntimeAdapter,
} from '../src/route-runtime';

function createContext(): RouteRuntimeContext {
  const controller = new NavigationSignalController();
  return {
    descriptor: {
      protocolVersion: ROUTE_RUNTIME_PROTOCOL_VERSION,
      routeId: 'root/users',
      owner: 'browser',
    },
    transaction: {
      transactionId: 'tx-1',
      action: 'push',
      to: '/users',
      signal: controller.signal,
    },
  };
}

function createAdapter(
  name: string,
  priority: number | undefined,
  canHandle: RouteRuntimeAdapter['canHandle'],
): RouteRuntimeAdapter {
  return {
    name,
    owner: 'browser',
    priority,
    canHandle,
    activate: jest.fn(),
  };
}

describe('NavigationSignal', () => {
  it('cancels once, notifies current listeners and exposes the reason', () => {
    const controller = new NavigationSignalController();
    const first = jest.fn();
    const removed = jest.fn();
    controller.signal.onCancel(first);
    const unsubscribe = controller.signal.onCancel(removed);

    unsubscribe();
    unsubscribe();
    controller.cancel('superseded');
    controller.cancel('ignored');

    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith('superseded');
    expect(removed).not.toHaveBeenCalled();
    expect(controller.signal).toMatchObject({ cancelled: true, reason: 'superseded' });
  });

  it('immediately notifies listeners registered after cancellation', () => {
    const controller = new NavigationSignalController();
    controller.cancel();
    const late = jest.fn();

    const unsubscribe = controller.signal.onCancel(late);
    unsubscribe();

    expect(late).toHaveBeenCalledWith(undefined);
  });
});

describe('route runtime descriptor', () => {
  const descriptor = {
    protocolVersion: ROUTE_RUNTIME_PROTOCOL_VERSION,
    routeId: 'root/profile:main',
    owner: 'framework',
  } as const;

  it('validates the frozen protocol shape', () => {
    expect(isRouteRuntimeDescriptor(descriptor)).toBe(true);
    expect(isRouteRuntimeDescriptor(null)).toBe(false);
    expect(isRouteRuntimeDescriptor({ ...descriptor, protocolVersion: 2 })).toBe(false);
    expect(isRouteRuntimeDescriptor({ ...descriptor, routeId: '' })).toBe(false);
    expect(isRouteRuntimeDescriptor({ ...descriptor, routeId: 1 })).toBe(false);
    expect(isRouteRuntimeDescriptor({ ...descriptor, owner: 'unknown' })).toBe(false);
    expect(isRouteRuntimeDescriptor({ ...descriptor, owner: 'browser' })).toBe(true);
    expect(isRouteRuntimeDescriptor({ ...descriptor, owner: 'standalone-ssr' })).toBe(true);
  });

  it('uses client rendering as the optional compatibility fallback', () => {
    expect(resolveRuntimeCompatibility(descriptor)).toEqual({ status: 'supported' });
    expect(resolveRuntimeCompatibility({ protocolVersion: 2 }, false)).toEqual({
      status: 'unavailable',
      fallback: 'client-render',
      reason: 'Invalid or unsupported route runtime descriptor',
    });
    expect(resolveRuntimeCompatibility({}, true).fallback).toBe('error');
  });
});

describe('runtime adapter selection', () => {
  it('returns null when no adapter accepts the context', async () => {
    const adapter = createAdapter('browser', 0, () => false);
    await expect(selectRouteRuntimeAdapter([adapter], createContext())).resolves.toBeNull();
  });

  it('supports async detection and selects the unique highest priority', async () => {
    const fallback = createAdapter('fallback', undefined, () => true);
    const framework = createAdapter('framework', 10, () => Promise.resolve(true));
    const ignored = createAdapter('ignored', 100, () => false);

    await expect(selectRouteRuntimeAdapter(
      [fallback, framework, ignored],
      createContext(),
    )).resolves.toBe(framework);
  });

  it('rejects equal-priority ownership conflicts', async () => {
    const first = createAdapter('first', 5, () => true);
    const second = createAdapter('second', 5, () => true);

    await expect(selectRouteRuntimeAdapter([first, second], createContext()))
      .rejects.toEqual(expect.objectContaining({
        name: 'RouteRuntimeAdapterConflictError',
        adapterNames: ['first', 'second'],
      }));
    await expect(selectRouteRuntimeAdapter([first, second], createContext()))
      .rejects.toBeInstanceOf(RouteRuntimeAdapterConflictError);
  });
});
