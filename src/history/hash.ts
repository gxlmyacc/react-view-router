import {
  State, History, HashType, To, HistoryType, HistoryOptions,
} from './types';
import {
  getBaseHref, getPossibleHashType, createHref, parsePath, readonly,
} from './utils';
import { createHistory } from './history';

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

export interface HashHistoryOptions extends HistoryOptions {
  window?: Window,
  hashType?: HashType,
}

export function createHashHref(to: To, hashType?: HashType, _window: any = global) {
  let path = createHref(to, hashType);

  const searchIndex = path.indexOf('?');
  if (searchIndex > 0 && _window?.location?.search) {
    const searchs = path.substr(searchIndex + 1).split('&');
    path = path.substr(0, searchIndex);
    _window.location?.search.substr(1)
      .split('&').forEach((value: string) => {
        let idx = searchs.indexOf(value);
        if (~idx) searchs.splice(idx, 1);
      });
    if (searchs.length) path += '?' + searchs.join('&');
  }

  if (!path.startsWith('#')) path = '#' + path;
  return getBaseHref() + path;
}

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
  const {
    window: _window = global.document?.defaultView!,
  } = options;
  const {
    hashType = getPossibleHashType(_window)
  } = options;

  const type = HistoryType.hash;

  const history = createHistory({
    window: _window,
    type,
    getLocationPath: () => {
      let path = _window.location.hash.substr(1);
      if (path && !path.startsWith('/')) path = '/' + path;
      if (_window?.location?.search) {
        const search = _window.location.search;
        let searchIndex = path.indexOf('?');
        if (searchIndex >= 0) {
          path = path.substr(0, searchIndex) + search + '&' + path.substr(searchIndex + 1);
        } else path += search;
      }
      return parsePath(path);
    },
    createHref: (to: To) => createHashHref(to, hashType, _window),
    extra: options.extra,
  }) as HashHistory;

  readonly(history, 'hashType', () => hashType);

  return history;
}

