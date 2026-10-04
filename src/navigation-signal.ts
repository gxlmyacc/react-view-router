export type NavigationCancelListener = (reason?: unknown) => void;

/** Platform-neutral cancellation contract for Chrome 49 and React Native. */
export interface NavigationSignal {
  readonly cancelled: boolean;
  readonly reason?: unknown;
  onCancel(listener: NavigationCancelListener): () => void;
}

interface MutableNavigationSignal extends NavigationSignal {
  cancel(reason?: unknown): void;
}

function noop() {}

function createMutableNavigationSignal(): MutableNavigationSignal {
  let cancelled = false;
  let reason: unknown;
  const listeners: NavigationCancelListener[] = [];

  return {
    get cancelled() { return cancelled; },
    get reason() { return reason; },
    onCancel(listener) {
      if (cancelled) {
        listener(reason);
        return noop;
      }

      listeners.push(listener);
      let listening = true;
      return () => {
        if (!listening) return;
        listening = false;
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      };
    },
    cancel(cancelReason?: unknown) {
      if (cancelled) return;
      cancelled = true;
      reason = cancelReason;

      const currentListeners = listeners.slice();
      listeners.length = 0;
      currentListeners.forEach((listener) => listener(cancelReason));
    },
  };
}

export class NavigationSignalController {

  readonly signal: NavigationSignal;

  private mutableSignal: MutableNavigationSignal;

  constructor() {
    this.mutableSignal = createMutableNavigationSignal();
    this.signal = this.mutableSignal;
  }

  cancel(reason?: unknown) {
    this.mutableSignal.cancel(reason);
  }

}
