import { NavigationSignalController } from '../src/navigation-signal';

describe('NavigationSignalController', () => {
  it('immediately notifies late listeners and makes cancellation idempotent', () => {
    const controller = new NavigationSignalController();
    const listener = jest.fn();
    controller.cancel('superseded');
    const unsubscribe = controller.signal.onCancel(listener);
    controller.cancel('ignored');
    unsubscribe();
    expect(controller.signal.cancelled).toBe(true);
    expect(controller.signal.reason).toBe('superseded');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('superseded');
  });

  it('unsubscribe can be called repeatedly and does not cancel remaining subscribers', () => {
    const controller = new NavigationSignalController();
    const removed = jest.fn();
    const retained = jest.fn();
    const unsubscribe = controller.signal.onCancel(removed);
    controller.signal.onCancel(retained);
    unsubscribe();
    unsubscribe();
    controller.cancel();
    expect(removed).not.toHaveBeenCalled();
    expect(retained).toHaveBeenCalledWith(undefined);
    expect(controller.signal.reason).toBeUndefined();
  });

  it('取消后调用取消订阅不会尝试再次移除已清空的 listener', () => {
    const controller = new NavigationSignalController();
    const unsubscribe = controller.signal.onCancel(jest.fn());
    controller.cancel('done');
    expect(() => unsubscribe()).not.toThrow();
  });
});
