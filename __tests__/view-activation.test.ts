import { RouterViewComponent } from '../src/router-view';
import { createTestRouter } from './helpers/test-utils';

describe('shared view activation dispatch', () => {
  it.each(['activate', 'deactivate'] as const)('%s dispatch preserves KeepAlive ordering and instance binding', (type) => {
    const router = createTestRouter();
    const view = new RouterViewComponent({ router });
    const order: string[] = [];
    const instance = {
      componentDidActivate() { expect(this).toBe(instance); order.push('class'); },
      componentWillUnactivate() { expect(this).toBe(instance); order.push('class'); },
    };
    const target = { path: '/parent', componentInstances: { default: instance } } as any;
    const event = { type, router, source: view, target, to: target, from: null };
    view._events[type].push((received) => { expect(received).toBe(event); order.push('hook'); });
    view._notifyViewActivation(event);
    expect(order).toEqual(type === 'activate' ? ['class', 'hook'] : ['hook', 'class']);
    router.stop();
  });

  it('uses the cached instance override rather than the current route instance', () => {
    const router = createTestRouter();
    const view = new RouterViewComponent({ router });
    const cached = { componentDidActivate: jest.fn() };
    const current = { componentDidActivate: jest.fn() };
    const target = { componentInstances: { default: current } } as any;
    view._notifyViewActivation({ type: 'activate', router, source: view, target, to: target, from: null }, cached);
    expect(cached.componentDidActivate).toHaveBeenCalledTimes(1);
    expect(current.componentDidActivate).not.toHaveBeenCalled();
    router.stop();
  });
});
