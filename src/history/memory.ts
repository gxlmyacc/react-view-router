import {
  State, History, To, Location, Action, Listener, Blocker,
  HistoryType, PartialLocation, HistoryOptions
} from './types';
import {
  createEvents, createPath, createKey, parsePath, freeze, clamp, allowTx
} from './utils';
/**
 * A memory history stores locations in memory. This is useful in stateful
 * environments where there is no web browser, such as node tests or React
 * Native.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#memoryhistory
 */
export interface MemoryHistory<S extends State = State> extends History<S> {
  length: number;
  index: number;
}

/**
 * A user-supplied object that describes a location. Used when providing
 * entries to `createMemoryHistory` via its `initialEntries` option.
 */
export type InitialEntry = string | PartialLocation;

export interface MemoryHistoryOptions extends HistoryOptions {
   initialEntries?: InitialEntry[];
   initialIndex?: number;
 }

export function createMemoryHref(to: To) {
  return typeof to === 'string' ? to : createPath(to);
}

/**
  * Memory history stores the current location in memory. It is designed for use
  * in stateful non-browser environments like tests and React Native.
  *
  * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#creatememoryhistory
  */
export function createMemoryHistory(
  options: MemoryHistoryOptions = {}
): MemoryHistory {
  const { initialEntries = ['/'], initialIndex } = options;

  const entries: Location[] = initialEntries.map(entry => {
    const location = freeze<Location>({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: createKey(),
      ...(typeof entry === 'string' ? parsePath(entry) : entry)
    });

    return location;
  });
  let index = clamp(
    initialIndex == null ? entries.length - 1 : initialIndex,
    0,
    entries.length - 1
  );

  const type = HistoryType.memory;
  let action = Action.Push;
  let location = entries[index];
  const listeners = createEvents<Listener>();
  const blockers = createEvents<Blocker>();

  const createHref = (to: To) => createMemoryHref(to);

  function getNextLocation(to: To, state: State = null): Location {
    const { pathname = '/', search = '', hash = '' } = location;
    return freeze<Location>({
      pathname,
      search,
      hash,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey()
    });
  }

  function applyTx(nextAction: Action, nextLocation: Location, nextIndex: number, payload?: any) {
    action = nextAction;
    location = nextLocation;
    index = nextIndex;
    listeners.call({ action, location, index }, payload);
  }

  function getIndex(delta?: number) {
    const ret = index;
    if (delta) {
      index = clamp(index + delta, 0, entries.length - 1);
    }
    return ret;
  }

  function push(to: To, state?: State) {
    const nextAction = Action.Push;
    const nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean, payload?: any) => {
      if (!ok) return;

      index = getIndex(typeof to !== 'string' ? to.delta : undefined) + 1;
      entries.splice(index, entries.length, nextLocation);
      applyTx(nextAction, nextLocation, index, payload);
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
    const nextAction = Action.Replace;
    const nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean, payload?: any) => {
      if (!ok) return;

      if (typeof to !== 'string' && to.delta) {
        index = clamp(index + to.delta, 0, entries.length - 1);
      }

      entries[index] = nextLocation;
      applyTx(nextAction, nextLocation, index, payload);
    };

    if (allowTx(
      blockers,
      nextAction,
      nextLocation,
      index,
      getIndex(typeof to !== 'string' ? to.delta : undefined),
      callback
    )) {
      callback(true, to);
    }
  }

  function go(delta: number) {
    const nextIndex = clamp(index + delta, 0, entries.length - 1);
    const nextAction = Action.Pop;
    const nextLocation = entries[nextIndex];

    const callback = (ok: boolean, payload?: any) => {
      if (!ok) return;

      index = nextIndex;
      applyTx(nextAction, nextLocation, index, payload);
    };

    if (
      allowTx(
        blockers,
        nextAction,
        nextLocation,
        index,
        getIndex(delta),
        callback
      )) {
      callback(true);
    }
  }

  const history: MemoryHistory = {
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
      return entries.length;
    },
    get state() {
      return location.state;
    },
    get realtimeLocation() {
      return location;
    },
    createHref,
    getIndexAndLocation() {
      return [index, location];
    },
    push,
    replace,
    replaceState(state: State) {
      return location.state = state;
    },
    refresh() {
      return [index, location];
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
