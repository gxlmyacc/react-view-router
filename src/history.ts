/**
 * Actions represent the type of change to a location value.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#action
 */
export enum Action {
  /**
   * A POP indicates a change to an arbitrary index in the history stack, such
   * as a back or forward navigation. It does not describe the direction of the
   * navigation, only that the current index changed.
   *
   * Note: This is the default action for newly created history objects.
   */
  // eslint-disable-next-line no-unused-vars
  Pop = 'POP',

  /**
   * A PUSH indicates a new entry being added to the history stack, such as when
   * a link is clicked and a new page loads. When this happens, all subsequent
   * entries in the stack are lost.
   */
  // eslint-disable-next-line no-unused-vars
  Push = 'PUSH',

  /**
   * A REPLACE indicates the entry at the current index in the history stack
   * being replaced by a new one.
   */
  // eslint-disable-next-line no-unused-vars
  Replace = 'REPLACE'
}

export type HashType = 'slash'|'noslash';

/**
 * A URL pathname, beginning with a /.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.pathname
 */
export type Pathname = string;

/**
 * A URL search string, beginning with a ?.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.search
 */
export type Search = string;

/**
 * A URL fragment identifier, beginning with a #.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.hash
 */
export type Hash = string;

/**
 * An object that is used to associate some arbitrary data with a location, but
 * that does not appear in the URL path.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.state
 */
export type State = object | null;

/**
 * A unique string associated with a location. May be used to safely store
 * and retrieve data in some other storage API, like `localStorage`.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.key
 */
export type Key = string;

/**
 * The pathname, search, and hash values of a URL.
 */
export interface Path {
  /**
   * A URL pathname, beginning with a /.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.pathname
   */
  pathname: Pathname;

  /**
   * A URL search string, beginning with a ?.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.search
   */
  search: Search;

  /**
   * A URL fragment identifier, beginning with a #.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.hash
   */
  hash: Hash;
}

/**
 * An entry in a history stack. A location contains information about the
 * URL path, as well as possibly some arbitrary state and a key.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location
 */
export interface Location<S extends State = State> extends Path {
  /**
   * An object of arbitrary data associated with this location.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.state
   */
  state: S;

  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.key
   */
  key: Key;
}

/**
 * A partial Path object that may be missing some properties.
 */
export interface PartialPath {
  /**
   * The URL pathname, beginning with a /.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.pathname
   */
  pathname?: Pathname;

  /**
   * The URL search string, beginning with a ?.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.search
   */
  search?: Search;

  /**
   * The URL fragment identifier, beginning with a #.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.hash
   */
  hash?: Hash;


  /**
   * The URL forward/back delta before beginning location
   */
  delta?: number;
}

/**
 * A partial Location object that may be missing some properties.
 */
export interface PartialLocation<S extends State = State> extends PartialPath {
  /**
   * An object of arbitrary data associated with this location.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.state
   */
  state?: S;

  /**
   * A unique string associated with this location. May be used to safely store
   * and retrieve data in some other storage API, like `localStorage`.
   *
   * Note: This value is always "default" on the initial location.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#location.key
   */
  key?: Key;
}

/**
 * A change to the current location.
 */
export interface Update<S extends State = State> {
  /**
   * The action that triggered the change.
   */
  action: Action;

  /**
   * The new location.
   */
  location: Location<S>;

  /**
   * The new location index.
   */
  index: number
}

/**
 * A function that receives notifications about location changes.
 */
export interface Listener<S extends State = State> {
  (update: Update<S>): void;
}

/**
 * A change to the current location that was blocked. May be retried
 * after obtaining user confirmation.
 */
export interface Transition<S extends State = State> extends Update<S> {
  /**
   * continue the update to the current location.
   */
  callback(ok: boolean): void;
}

/**
 * A function that receives transitions when navigation is blocked.
 */
export interface Blocker<S extends State = State> {
  (tx: Transition<S>): void;
}

/**
 * Describes a location that is the destination of some navigation, either via
 * `history.push` or `history.replace`. May be either a URL or the pieces of a
 * URL path.
 */
export type To = string | PartialPath;

export interface PopAction<S extends State = State> extends Update<S> {
  prevIndex: number,
  delta: number
}

/**
 * A history is an interface to the navigation stack. The history serves as the
 * source of truth for the current location, as well as provides a set of
 * methods that may be used to change it.
 *
 * It is similar to the DOM's `window.history` object, but with a smaller, more
 * focused API.
 */
export interface History<S extends State = State> {
  /**
   * The last action that modified the current location. This will always be
   * Action.Pop when a history instance is first created. This value is mutable.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.action
   */
  readonly action: Action;

  /**
   * The current location. This value is mutable.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.location
   */
  readonly location: Location<S>;

  /**
   * The current location index in history state
   */
  readonly index: number;

  /**
   * Returns a valid href for the given `to` value that may be used as
   * the value of an <a href> attribute.
   *
   * @param to - The destination URL
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.createHref
   */
  createHref(to: To): string;

  /**
   * Get current index and location from window.location
   *
   */
  getIndexAndLocation(): [number, Location];

  /**
   * Pushes a new location onto the history stack, increasing its length by one.
   * If there were any entries in the stack after the current one, they are
   * lost.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.push
   */
  push(to: To, state?: S): void;

  /**
   * Replaces the current location in the history stack with a new one.  The
   * location that was replaced will no longer be available.
   *
   * @param to - The new URL
   * @param state - Data to associate with the new location
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.replace
   */
  replace(to: To, state?: S): void;

  /**
   * Replaces the current location state
   *
   * @param state - Data to associate with the new location
   *
   */
  replaceState(state: State): void;

  /**
   * Navigates `n` entries backward/forward in the history stack relative to the
   * current index. For example, a "back" navigation would use go(-1).
   *
   * @param delta - The delta in the stack index
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.go
   */
  go(delta: number): void;

  /**
   * Navigates to the previous entry in the stack. Identical to go(-1).
   *
   * Warning: if the current location is the first location in the stack, this
   * will unload the current document.
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.back
   */
  back(): void;

  /**
   * Navigates to the next entry in the stack. Identical to go(1).
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.forward
   */
  forward(): void;

  /**
   * Sets up a listener that will be called whenever the current location
   * changes.
   *
   * @param listener - A function that will be called when the location changes
   * @returns unlisten - A function that may be used to stop listening
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.listen
   */
  listen(listener: Listener<S>): () => void;

  /**
   * Prevents the current location from changing and sets up a listener that
   * will be called instead.
   *
   * @param blocker - A function that will be called when a transition is blocked
   * @returns unblock - A function that may be used to stop blocking
   *
   * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.block
   */
  block(blocker: Blocker<S>): () => void;
}

/**
 * A browser history stores the current location in regular URLs in a web
 * browser environment. This is the standard for most web apps and provides the
 * cleanest URLs the browser's address bar.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#browserhistory
 */
export interface BrowserHistory<S extends State = State> extends History<S> {}

/**
 * A hash history stores the current location in the fragment identifier portion
 * of the URL in a web browser environment.
 *
 * This is ideal for apps that do not control the server for some reason
 * (because the fragment identifier is never sent to the server), including some
 * shared hosting environments that do not provide fine-grained controls over
 * which pages are served at which URLs.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#hashhistory
 */
export interface HashHistory<S extends State = State> extends History<S> {
  readonly hashType: HashType
}

/**
 * A memory history stores locations in memory. This is useful in stateful
 * environments where there is no web browser, such as node tests or React
 * Native.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#memoryhistory
 */
export interface MemoryHistory<S extends State = State> extends History<S> {
  index: number;
}

// eslint-disable-next-line no-constant-condition
const readOnly: <T extends unknown>(obj: T) => T = false /** __DEV__* */
  ? obj => Object.freeze(obj)
  : obj => obj;

// //////////////////////////////////////////////////////////////////////////////
// BROWSER
// //////////////////////////////////////////////////////////////////////////////

type HistoryState = {
  usr: State;
  key?: string;
  idx: number;
};

// const BeforeUnloadEventType = 'beforeunload';
const HashChangeEventType = 'hashchange';
const PopStateEventType = 'popstate';

export type BrowserHistoryOptions = { window?: Window };

/**
 * Browser history stores the location in regular URLs. This is the standard for
 * most web apps, but it requires some configuration on the server to ensure you
 * serve the same app at multiple URLs.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createbrowserhistory
 */
export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  let { window = document.defaultView! } = options;
  let globalHistory = window.history;

  function getIndexAndLocation(): [number, Location] {
    let { pathname, search, hash } = window.location;
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

  let blockedPopTx: Transition | null = null;
  let blockedPopAp: PopAction | null = null;
  let blockedPopDc: ((data: { index: number, location: Location }) => void) | null = null;
  function handlePop(e: Event) {
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
      blockedPopAp = null;
    } else if (blockers.length && delta) {
      const callback = (ok: boolean) => {
        blockedPopTx = null;
        if (ok) {
          applyTx(nextAction);
          return;
        }
        blockedPopAp = {
          action,
          index,
          location,
          prevIndex: nextIndex,
          delta
        };
        go(blockedPopAp.delta);
      };
      blockedPopTx = {
        index: nextIndex,
        action: nextAction,
        location: nextLocation,
        callback
      };
      blockers.call(blockedPopTx);
    } else {
      applyTx(nextAction);
    }
  }

  window.addEventListener(PopStateEventType, handlePop);

  let action = Action.Push;
  let [index, location] = getIndexAndLocation();
  let listeners = createEvents<Listener>();
  let blockers = createEvents<Blocker>();

  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
  }

  function createHref(to: To) {
    return typeof to === 'string' ? to : createPath(to);
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

  function allowTx(action: Action, location: Location, callback: (ok: boolean) => void) {
    return (
      !blockers.length || (blockers.call({ action, location, callback, }), false)
    );
  }

  function applyTx(nextAction: Action) {
    action = nextAction;
    [index, location] = getIndexAndLocation();
    listeners.call({ action, index, location });
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

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      const _cb = (index: number) => {
        pushHistoryState(nextLocation, index + 1);
        applyTx(nextAction);
      };

      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) =>  _cb(index);
        go(to.delta);
        return;
      }

      _cb(index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      const _cb = (index: number) => {
        replaceHistoryState(nextLocation, index);
        applyTx(nextAction);
      };
      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) => _cb(index);
        go(to.delta);
        return;
      }

      _cb(index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function go(delta: number) {
    globalHistory.go(delta);
  }

  let history: BrowserHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    get index() {
      return index;
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
      let unblock = blockers.push(blocker);

      return function () {
        unblock();
      };
    }
  };

  return history;
}

// //////////////////////////////////////////////////////////////////////////////
// HASH
// //////////////////////////////////////////////////////////////////////////////

export type HashHistoryOptions = { window?: Window, hashType?: HashType };

/**
 * Hash history stores the location in window.location.hash. This makes it ideal
 * for situations where you don't want to send the location to the server for
 * some reason, either because you do cannot configure it or the URL space is
 * reserved for something else.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createhashhistory
 */
export function createHashHistory(
  options: HashHistoryOptions = {}
): HashHistory {
  let { window = document.defaultView!, hashType = 'slash' } = options;
  let globalHistory = window.history;

  function getIndexAndLocation(): [number, Location] {
    let locationHash = window.location.hash.substr(1);
    if (locationHash && !locationHash.startsWith('/')) locationHash = '/' + locationHash;

    let { pathname = '/', search = '', hash = '' } = parsePath(locationHash);
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

  let blockedPopTx: Transition | null = null;
  let blockedPopAp: PopAction | null = null;
  let blockedPopDc: ((data: { index: number, location: Location }) => void) | null = null;
  function handlePop(e: Event) {
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
      blockedPopAp = null;
    } else if (blockers.length && delta) {
      const callback = (ok: boolean) => {
        blockedPopTx = null;
        if (ok) {
          applyTx(nextAction);
          return;
        }
        blockedPopAp = {
          action,
          index,
          location,
          prevIndex: nextIndex,
          delta
        };
        go(blockedPopAp.delta);
      };
      blockedPopTx = {
        index: nextIndex,
        action: nextAction,
        location: nextLocation,
        callback,
      };
      blockers.call(blockedPopTx);
    } else {
      applyTx(nextAction);
    }
  }

  window.addEventListener(PopStateEventType, handlePop);

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

  let action = Action.Push;
  let [index, location] = getIndexAndLocation();
  let listeners = createEvents<Listener>();
  let blockers = createEvents<Blocker>();

  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
  }

  function createHref(to: To) {
    let path = typeof to === 'string' ? to : createPath(to);

    let slashChar = path.substr(0, 1);
    if (hashType === 'slash') {
      if (slashChar !== '/') path = '/' + path;
    } else  if (hashType === 'noslash') {
      if (slashChar === '/') path = path.substr(1);
    }

    if (!path.startsWith('#')) path = '#' + path;
    return getBaseHref() + path;
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

  function allowTx(action: Action, location: Location, callback: (ok: boolean) => void) {
    return (
      !blockers.length || (blockers.call({ action, location, callback }), false)
    );
  }

  function applyTx(nextAction: Action) {
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
    listeners.call({ action, index, location });
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

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      const _cb = (index: number) => {
        pushHistoryState(nextLocation, index + 1);
        applyTx(nextAction);
      };

      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) => _cb(index);
        go(to.delta);
        return;
      }

      _cb(index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      const _cb = (index: number) => {
        replaceHistoryState(nextLocation, index);
        applyTx(nextAction);
      };

      if (typeof to !== 'string' && to.delta) {
        blockedPopDc = ({ index }) => _cb(index);
        go(to.delta);
        return;
      }

      _cb(index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function go(delta: number) {
    globalHistory.go(delta);
  }

  let history: HashHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    get index() {
      return index;
    },
    get hashType() {
      return hashType;
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
      let unblock = blockers.push(blocker);

      return function () {
        unblock();
      };
    }
  };

  return history;
}

// //////////////////////////////////////////////////////////////////////////////
// MEMORY
// //////////////////////////////////////////////////////////////////////////////

/**
 * A user-supplied object that describes a location. Used when providing
 * entries to `createMemoryHistory` via its `initialEntries` option.
 */
export type InitialEntry = string | PartialLocation;

export type MemoryHistoryOptions = {
  initialEntries?: InitialEntry[];
  initialIndex?: number;
};

/**
 * Memory history stores the current location in memory. It is designed for use
 * in stateful non-browser environments like tests and React Native.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#creatememoryhistory
 */
export function createMemoryHistory(
  options: MemoryHistoryOptions = {}
): MemoryHistory {
  let { initialEntries = ['/'], initialIndex } = options;
  let entries: Location[] = initialEntries.map(entry => {
    let location = readOnly<Location>({
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

  let action = Action.Push;
  let location = entries[index];
  let listeners = createEvents<Listener>();
  let blockers = createEvents<Blocker>();

  function createHref(to: To) {
    return typeof to === 'string' ? to : createPath(to);
  }

  function getNextLocation(to: To, state: State = null): Location {
    return readOnly<Location>({
      ...location,
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey()
    });
  }

  function allowTx(action: Action, location: Location, callback: (ok: boolean) => void) {
    return (
      !blockers.length || (blockers.call({
        action,
        location,
        callback
      }), false)
    );
  }

  function applyTx(nextAction: Action, nextLocation: Location, nextIndex: number) {
    action = nextAction;
    location = nextLocation;
    index = nextIndex;
    listeners.call({ action, location, index });
  }

  function push(to: To, state?: State) {
    let nextAction = Action.Push;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      if (typeof to !== 'string' && to.delta) {
        index = clamp(index + to.delta, 0, entries.length - 1);
      }

      index += 1;
      entries.splice(index, entries.length, nextLocation);
      applyTx(nextAction, nextLocation, index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function replace(to: To, state?: State) {
    let nextAction = Action.Replace;
    let nextLocation = getNextLocation(to, state);

    const callback = (ok: boolean) => {
      if (!ok) return;

      if (typeof to !== 'string' && to.delta) {
        index = clamp(index + to.delta, 0, entries.length - 1);
      }

      entries[index] = nextLocation;
      applyTx(nextAction, nextLocation, index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  function go(delta: number) {
    let nextIndex = clamp(index + delta, 0, entries.length - 1);
    let nextAction = Action.Pop;
    let nextLocation = entries[nextIndex];

    const callback = (ok: boolean) => {
      if (!ok) return;

      index = nextIndex;
      applyTx(nextAction, nextLocation, index);
    };

    if (allowTx(nextAction, nextLocation, callback)) {
      callback(true);
    }
  }

  let history: MemoryHistory = {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    get index() {
      return index;
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

// //////////////////////////////////////////////////////////////////////////////
// UTILS
// //////////////////////////////////////////////////////////////////////////////

function clamp(n: number, lowerBound: number, upperBound: number) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}

// function promptBeforeUnload(event: BeforeUnloadEvent) {
//   // Cancel the event.
//   event.preventDefault();
//   // Chrome (and legacy IE) requires returnValue to be set.
//   event.returnValue = '';
// }

type Events<F> = {
  length: number;
  push: (fn: F) => () => void;
  call: (arg: any) => void;
};

function createEvents<F extends Function>(): Events<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    push(fn: F) {
      handlers.push(fn);
      return function () {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(arg) {
      handlers.forEach(fn => fn && fn(arg));
    }
  };
}

function createKey() {
  return Math.random()
    .toString(36)
    .substr(2, 8);
}

export function getBaseHref() {
  let base = document.querySelector('base');
  let href = '';

  if (base && base.getAttribute('href')) {
    let url = window.location.href;
    let hashIndex = url.indexOf('#');
    href = hashIndex === -1 ? url : url.slice(0, hashIndex);
  }

  return href;
}

/**
 * Creates a string URL path from the given pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createpath
 */
export function createPath({
  pathname = '/',
  search = '',
  hash = ''
}: PartialPath) {
  return pathname + search + hash;
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#parsepath
 */
export function parsePath(path: string) {
  let partialPath: PartialPath = {};

  if (path) {
    let hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      partialPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
      if (path && !path.startsWith('/')) path = '/' + path;
    }

    let searchIndex = path.indexOf('?');
    if (searchIndex >= 0) {
      partialPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
      if (path && !path.startsWith('/')) path = '/' + path;
    }

    if (path) {
      partialPath.pathname = path;
    }
  }

  return partialPath;
}
