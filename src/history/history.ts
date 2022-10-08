import {
  History, Transition, PopAction, Location, Action, Blocker, State, HistoryType, To,
  Listener, HistoryState, PartialPath
} from './types';
import { createPath, readOnly, createEvents, parsePath, createKey, allowTx } from './utils';

// const BeforeUnloadEventType = 'beforeunload';
export const HashChangeEventType = 'hashchange';
export const PopStateEventType = 'popstate';

export function createHistory(
  options: {
    window: Window,
    type: HistoryType,
    getLocationPath: () => PartialPath,
    createHref: (to: To) => string,
    extra?: any,
  }
): History {
  const { window, type, getLocationPath, createHref } = options;

  let globalHistory = window.history;

  function getIndexAndLocation(): [number, Location] {
    let { pathname = '/', search = '', hash = '' } = getLocationPath();
    let state = globalHistory.state || {};
    return [
      state.idx,
      readOnly<Location>({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || 'default'
      })
    ];
  }

  let action = Action.Push;
  let [index, location] = getIndexAndLocation();
  let listeners = createEvents<Listener>();
  let blockers = createEvents<Blocker>();

  function getIndex(delta?: number) {
    let ret = index;
    if (delta) ret = Math.max(index + delta, 0);
    return ret;
  }

  function getNextLocation(to: To, state: State = null): Location {
    return readOnly<Location>({
      ...location,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey()
    });
  }

  function getHistoryState(nextLocation: Location, index: number) {
    return {
      usr: nextLocation.state,
      key: nextLocation.key,
      idx: index
    };
  }

  function getHistoryStateAndUrl(
    nextLocation: Location,
    index: number
  ): [HistoryState, string] {
    return [
      getHistoryState(nextLocation, index),
      createHref(nextLocation)
    ];
  }


  function applyTx(nextAction: Action, payload?: any) {
    action = nextAction;
    let prevIndex = index;
    [index, location] = getIndexAndLocation();
    if (index == null && prevIndex != null) {
      index = (nextAction === Action.Push
        ? prevIndex + 1
        : nextAction === Action.Replace
          ? prevIndex
          : prevIndex - 1
      );
    }
    listeners.call({ action, index, location }, payload);
  }

  function pushHistoryState(location: Location, index: number) {
    let [historyState, url] = getHistoryStateAndUrl(location, index);

    // TODO: Support forced reloading
    // try...catch because iOS limits us to 100 pushState calls :/
    try {
      globalHistory.pushState(historyState, '', url);
    } catch (error) {
      // They are going to lose state here, but there is no real
      // way to warn them about it since the page will refresh...
      window.location.assign(url);
    }

    return index;
  }

  function replaceHistoryState(location: Location, index: number) {
    let [historyState, url] = getHistoryStateAndUrl(location, index);

    // TODO: Support forced reloading
    globalHistory.replaceState(historyState, '', url);

    return index;
  }

  let blockedPopTx: Transition | null = null;
  let blockedPopAp: PopAction|null = null;
  let blockedPopDc: ((data: { index: number, location: Location }) => void) | null = null;

  function go(delta: number) {
    blockedPopTx = null;
    globalHistory.go(delta);
  }

  function handlePop(e: Event) {
    let index = getIndex();
    let [nextIndex, nextLocation] = getIndexAndLocation();
    if (nextIndex == null) {
      if (index == null || isNaN(index)) index = 0;
      nextIndex = replaceHistoryState(nextLocation, index + 1);
    }
    let delta = index - nextIndex;
    let nextAction = delta > 0 ? Action.Pop : Action.Push;

    if (blockedPopDc) {
      blockedPopDc({ index: nextIndex, location: nextLocation });
      blockedPopDc = null;
    } else if (blockedPopAp) {
      if (nextIndex === blockedPopAp.prevIndex) {
        go(blockedPopAp.delta);
        return;
      }
      blockedPopAp.cb && blockedPopAp.cb();
      blockedPopAp = null;
    } else if (blockers.length && delta) {
      let seed = 0;
      const callback = (ok: boolean, payload?: any) => {
        if (!blockedPopTx) return;
        if (ok) {
          blockedPopTx = null;
          applyTx(nextAction, payload);
          return;
        }
        blockedPopTx.backCallback(seed);
      };
      nextLocation.fromEvent = true;
      blockedPopTx = {
        seed,
        index,
        nextIndex,
        action: nextAction,
        location: nextLocation,
        callback,
        backCallback(seed) {
          if (this.seed !== seed) return;
          blockedPopTx = null;
          blockedPopAp = {
            action,
            index,
            location,
            prevIndex: nextIndex,
            delta
          };
          go(blockedPopAp.delta);
        }
      };
      blockers.call(blockedPopTx);
    } else {
      applyTx(nextAction);
    }
  }

  window.addEventListener(PopStateEventType, handlePop);
  if (type === HistoryType.hash) {
    // popstate does not fire on hashchange in IE 11 and old (trident) Edge
    // https://developer.mozilla.org/de/docs/Web/API/Window/popstate_event
    window.addEventListener(HashChangeEventType, e => {
      if (blockedPopTx || blockedPopAp) return;

      let [, nextLocation] = getIndexAndLocation();

      // Ignore extraneous hashchange events.
      if (createPath(nextLocation) !== createPath(location)) {
        handlePop(e);
      }
    });
  }

  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
  }

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);

    const seed = blockedPopTx ? ++blockedPopTx.seed : -1;
    const callback = (ok: boolean, payload?: any) => {
      if (!ok) {
        if (blockedPopTx) blockedPopTx.backCallback(seed);
        return;
      }
      if (blockedPopTx && blockedPopTx.seed === seed) {
        blockedPopTx = null;
      }

      const _cb = (index: number) => {
        pushHistoryState(nextLocation, index + 1);
        applyTx(nextAction, payload);
      };

      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) => _cb(index);
        go(to.delta);
        return;
      }

      if (blockedPopAp) (blockedPopAp as unknown as PopAction).cb = () => _cb(index);
      else _cb(index);
    };

    if (allowTx(
      blockers,
      nextAction,
      nextLocation,
      index,
      getIndex(typeof to !== 'string' ? to.delta : undefined) + 1,
      callback
    )) {
      callback(true, to);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);

    const seed = blockedPopTx ? ++blockedPopTx.seed : -1;
    const callback = (ok: boolean, payload?: any) => {
      if (!ok) {
        if (blockedPopTx) blockedPopTx.backCallback(seed);
        return;
      }
      if (blockedPopTx && blockedPopTx.seed === seed) {
        blockedPopTx = null;
      }

      const _cb = (index: number) => {
        replaceHistoryState(nextLocation, index);
        applyTx(nextAction, payload);
      };

      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) => _cb(index);
        go(to.delta);
        return;
      }

      if (blockedPopAp) (blockedPopAp as unknown as PopAction).cb = () => _cb(index);
      else _cb(index);
    };

    if (allowTx(
      blockers,
      nextAction,
      nextLocation,
      index,
      getIndex(typeof to !== 'string' ? to.delta : undefined),
      callback
    )) {
      callback(true);
    }
  }

  let history: History = {
    get extra() {
      return options.extra;
    },
    get type() {
      return type;
    },
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    get index() {
      return index;
    },
    get length() {
      return globalHistory.length;
    },
    get realtimeLocation() {
      const [, current] = getIndexAndLocation();
      return (current.pathname === location.pathname && current.search === location.search && current.hash === location.hash)
        ? location
        : current;
    },
    createHref,
    getIndexAndLocation,
    push,
    replace,
    replaceState(state: State) {
      const historyState = getHistoryState(location, index);
      historyState.usr = state;
      globalHistory.replaceState(historyState, '');
      return state;
    },
    go,
    back() {
      go(-1);
    },
    forward() {
      go(1);
    },
    listen(listener) {
      return listeners.push(listener);
    },
    block(blocker) {
      return blockers.push(blocker);
    }
  };

  return history;
}
