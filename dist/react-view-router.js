module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/esm/extends.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _extends;

function _extends() {
  exports.default = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _inheritsLoose;

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _objectWithoutPropertiesLoose;

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! regenerator-runtime */ "regenerator-runtime");

/***/ }),

/***/ "./node_modules/history-fix/esm/history.js":
/*!*************************************************!*\
  !*** ./node_modules/history-fix/esm/history.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBrowserHistory = createBrowserHistory;
exports.createHashHistory = createHashHistory;
exports.createMemoryHistory = createMemoryHistory;
exports.createLocation = createLocation;
exports.locationsAreEqual = locationsAreEqual;
exports.parsePath = parsePath;
exports.createPath = createPath;

var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js"));

var _resolvePathname = _interopRequireDefault(__webpack_require__(/*! resolve-pathname */ "./node_modules/resolve-pathname/index.js"));

var _valueEqual = _interopRequireDefault(__webpack_require__(/*! value-equal */ "./node_modules/value-equal/index.js"));

var _tinyWarning = _interopRequireDefault(__webpack_require__(/*! tiny-warning */ "./node_modules/tiny-warning/dist/tiny-warning.esm.js"));

var _tinyInvariant = _interopRequireDefault(__webpack_require__(/*! tiny-invariant */ "./node_modules/tiny-invariant/dist/tiny-invariant.esm.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
}

function hasBasename(path, prefix) {
  return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}

function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';
  var hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}

function createPath(location) {
  var pathname = location.pathname;
  var search = location.search;
  var hash = location.hash;
  var path = pathname || '/';
  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;
  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;
  return path;
}

function createLocation(path, state, key, currentLocation) {
  var location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = (0, _extends2.default)({}, path);
    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = (0, _resolvePathname.default)(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual.default)(a.state, b.state);
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
     true ? (0, _tinyWarning.default)(prompt == null, 'A history supports only one prompt at a time') : undefined;
    prompt = nextPrompt;
    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  }

  function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
           true ? (0, _tinyWarning.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : undefined;
          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  var listeners = [];

  function appendListener(fn) {
    var isActive = true;

    function listener() {
      if (isActive) fn.apply(void 0, arguments);
    }

    listeners.push(listener);
    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notifyListeners() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  }

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function getConfirmation(message, callback) {
  callback(window.confirm(message)); // eslint-disable-line no-alert
}
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */


function supportsHistory() {
  var ua = window.navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
  return window.history && 'pushState' in window.history;
}
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */


function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */


function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
}
/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */


function isExtraneousPopstateEvent(event) {
  event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
}

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
}
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */


function createBrowserHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ?  true ? (0, _tinyInvariant.default)(false, 'Browser history needs a DOM') : undefined : void 0;
  var globalHistory = window.history;
  var canUseHistory = supportsHistory();
  var needsHashChangeListener = !supportsPopStateOnHashChange();
  var _props = props;
  var _props$forceRefresh = _props.forceRefresh;
  var forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh;
  var _props$getUserConfirm = _props.getUserConfirmation;
  var getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm;
  var _props$keyLength = _props.keyLength;
  var keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

  function getDOMLocation(historyState) {
    var _ref = historyState || {};

    var key = _ref.key;
    var state = _ref.state;
    var _window$location = window.location;
    var pathname = _window$location.pathname;
    var search = _window$location.search;
    var hash = _window$location.hash;
    var path = pathname + search + hash;
     true ? (0, _tinyWarning.default)(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : undefined;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path, state, key);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    (0, _extends2.default)(history, nextState);
    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  var forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allKeys.indexOf(fromLocation.key);
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  }

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key]; // Public interface

  function createHref(location) {
    return basename + createPath(location);
  }

  function push(path, state) {
     true ? (0, _tinyWarning.default)(!(_typeof(path) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : undefined;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key;
      var state = location.state;

      if (canUseHistory) {
        globalHistory.pushState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
         true ? (0, _tinyWarning.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : undefined;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
     true ? (0, _tinyWarning.default)(!(_typeof(path) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : undefined;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key;
      var state = location.state;

      if (canUseHistory) {
        globalHistory.replaceState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
          setState({
            action: action,
            location: location
          });
        }
      } else {
         true ? (0, _tinyWarning.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : undefined;
        window.location.replace(href);
      }
    });
  }

  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

var HashChangeEvent$1 = 'hashchange';
var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: stripLeadingSlash,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
}

function pushHashPath(path) {
  window.location.hash = path;
}

function replaceHashPath(path) {
  var hashIndex = window.location.href.indexOf('#');
  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
}

function createHashHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ?  true ? (0, _tinyInvariant.default)(false, 'Hash history needs a DOM') : undefined : void 0;
  var globalHistory = window.history;
  var canGoWithoutReload = supportsGoWithoutReloadUsingHash();
  var _props = props;
  var _props$getUserConfirm = _props.getUserConfirmation;
  var getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm;
  var _props$hashType = _props.hashType;
  var hashType = _props$hashType === void 0 ? 'slash' : _props$hashType;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
  var _HashPathCoders$hashT = HashPathCoders[hashType];
  var encodePath = _HashPathCoders$hashT.encodePath;
  var decodePath = _HashPathCoders$hashT.decodePath;

  function getDOMLocation() {
    var path = decodePath(getHashPath());
     true ? (0, _tinyWarning.default)(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : undefined;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    (0, _extends2.default)(history, nextState);
    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  var forceNextPop = false;
  var ignorePath = null;

  function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;
      if (!forceNextPop && locationsAreEqual(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;
      if (allPaths.length && allPaths[allPaths.length - 1] !== path) allPaths.push(path);
      handlePop(location);
    }
  }

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf(createPath(toLocation));
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  } // Ensure the hash is encoded properly before doing anything else.


  var path = getHashPath();
  var encodedPath = encodePath(path);
  if (path !== encodedPath) replaceHashPath(encodedPath);
  var initialLocation = getDOMLocation();
  var allPaths = [createPath(initialLocation)]; // Public interface

  function createHref(location) {
    return '#' + encodePath(basename + createPath(location));
  }

  function push(path, state) {
     true ? (0, _tinyWarning.default)(state === undefined, 'Hash history cannot push state; it is ignored') : undefined;
    var action = 'PUSH';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);
        var prevIndex = allPaths.lastIndexOf(createPath(history.location));
        var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
        nextPaths.push(path);
        allPaths = nextPaths;
        setState({
          action: action,
          location: location
        });
      } else {
         true ? (0, _tinyWarning.default)(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : undefined;
        setState();
      }
    });
  }

  function replace(path, state) {
     true ? (0, _tinyWarning.default)(state === undefined, 'Hash history cannot replace state; it is ignored') : undefined;
    var action = 'REPLACE';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf(createPath(history.location));
      if (prevIndex !== -1) allPaths[prevIndex] = path;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
     true ? (0, _tinyWarning.default)(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : undefined;
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(HashChangeEvent$1, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(HashChangeEvent$1, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

function clamp(n, lowerBound, upperBound) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}
/**
 * Creates a history object that stores locations in memory.
 */


function createMemoryHistory(props) {
  if (props === void 0) {
    props = {};
  }

  var _props = props;
  var getUserConfirmation = _props.getUserConfirmation;
  var _props$initialEntries = _props.initialEntries;
  var initialEntries = _props$initialEntries === void 0 ? ['/'] : _props$initialEntries;
  var _props$initialIndex = _props.initialIndex;
  var initialIndex = _props$initialIndex === void 0 ? 0 : _props$initialIndex;
  var _props$keyLength = _props.keyLength;
  var keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var transitionManager = createTransitionManager();

  function setState(nextState) {
    (0, _extends2.default)(history, nextState);
    history.length = history.entries.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var index = clamp(initialIndex, 0, initialEntries.length - 1);
  var entries = initialEntries.map(function (entry) {
    return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, entry.key || createKey());
  }); // Public interface

  var createHref = createPath;

  function push(path, state) {
     true ? (0, _tinyWarning.default)(!(_typeof(path) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : undefined;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var prevIndex = history.index;
      var nextIndex = prevIndex + 1;
      var nextEntries = history.entries.slice(0);

      if (nextEntries.length > nextIndex) {
        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
      } else {
        nextEntries.push(location);
      }

      setState({
        action: action,
        location: location,
        index: nextIndex,
        entries: nextEntries
      });
    });
  }

  function replace(path, state) {
     true ? (0, _tinyWarning.default)(!(_typeof(path) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : undefined;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      history.entries[history.index] = location;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
    var action = 'POP';
    var location = history.entries[nextIndex];
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (ok) {
        setState({
          action: action,
          location: location,
          index: nextIndex
        });
      } else {
        // Mimic the behavior of DOM histories by
        // causing a render after a cancelled POP.
        setState();
      }
    });
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  function canGo(n) {
    var nextIndex = history.index + n;
    return nextIndex >= 0 && nextIndex < history.entries.length;
  }

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    return transitionManager.setPrompt(prompt);
  }

  function listen(listener) {
    return transitionManager.appendListener(listener);
  }

  var history = {
    length: entries.length,
    action: 'POP',
    location: entries[index],
    index: index,
    entries: entries,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    canGo: canGo,
    block: block,
    listen: listen
  };
  return history;
}

/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/***/ }),

/***/ "./node_modules/path-to-regexp/index.js":
/*!**********************************************!*\
  !*** ./node_modules/path-to-regexp/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isarray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js");
/**
 * Expose `pathToRegexp`.
 */


module.exports = pathToRegexp;
module.exports.parse = parse;
module.exports.compile = compile;
module.exports.tokensToFunction = tokensToFunction;
module.exports.tokensToRegExp = tokensToRegExp;
/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */

var PATH_REGEXP = new RegExp([// Match escaped characters that would otherwise appear in future matches.
// This allows the user to escape special characters that won't transform.
'(\\\\.)', // Match Express-style parameters and un-named parameters with a prefix
// and optional suffixes. Matches appear as:
//
// "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
// "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
// "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
'([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'].join('|'), 'g');
/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */

function parse(str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length; // Ignore already escaped sequences.

    if (escaped) {
      path += escaped[1];
      continue;
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7]; // Push the current path onto the tokens.

    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;
    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?'
    });
  } // Match any characters still remaining.


  if (index < str.length) {
    path += str.substr(index);
  } // If the path exists, push it onto the end.


  if (path) {
    tokens.push(path);
  }

  return tokens;
}
/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */


function compile(str, options) {
  return tokensToFunction(parse(str, options));
}
/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */


function encodeURIComponentPretty(str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */


function encodeAsterisk(str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
/**
 * Expose a method for transforming tokens into the path function.
 */


function tokensToFunction(tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length); // Compile all the patterns before compilation.

  for (var i = 0; i < tokens.length; i++) {
    if (_typeof(tokens[i]) === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;
        continue;
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue;
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined');
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`');
        }

        if (value.length === 0) {
          if (token.optional) {
            continue;
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty');
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`');
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue;
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
      }

      path += token.prefix + segment;
    }

    return path;
  };
}
/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */


function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
}
/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */


function escapeGroup(group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}
/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */


function attachKeys(re, keys) {
  re.keys = keys;
  return re;
}
/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */


function flags(options) {
  return options.sensitive ? '' : 'i';
}
/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */


function regexpToRegexp(path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys);
}
/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */


function arrayToRegexp(path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys);
}
/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */


function stringToRegexp(path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */


function tokensToRegExp(tokens, keys, options) {
  if (!isarray(keys)) {
    options =
    /** @type {!Object} */
    keys || options;
    keys = [];
  }

  options = options || {};
  var strict = options.strict;
  var end = options.end !== false;
  var route = ''; // Iterate over the tokens and create our regexp string.

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';
      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter; // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".

  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */


function pathToRegexp(path, keys, options) {
  if (!isarray(keys)) {
    options =
    /** @type {!Object} */
    keys || options;
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path,
    /** @type {!Array} */
    keys);
  }

  if (isarray(path)) {
    return arrayToRegexp(
    /** @type {!Array} */
    path,
    /** @type {!Array} */
    keys, options);
  }

  return stringToRegexp(
  /** @type {string} */
  path,
  /** @type {!Array} */
  keys, options);
}

/***/ }),

/***/ "./node_modules/react-router-dom/esm/react-router-dom.js":
/*!***************************************************************!*\
  !*** ./node_modules/react-router-dom/esm/react-router-dom.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  BrowserRouter: true,
  HashRouter: true,
  Link: true,
  NavLink: true
};
exports.NavLink = NavLink;
exports.Link = exports.HashRouter = exports.BrowserRouter = void 0;

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/esm/react-router.js");

Object.keys(_reactRouter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _reactRouter[key];
    }
  });
});

var _history = __webpack_require__(/*! history */ "./node_modules/history-fix/esm/history.js");

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "prop-types"));

var _tinyWarning = _interopRequireDefault(__webpack_require__(/*! tiny-warning */ "./node_modules/tiny-warning/dist/tiny-warning.esm.js"));

var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutPropertiesLoose */ "./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"));

var _tinyInvariant = _interopRequireDefault(__webpack_require__(/*! tiny-invariant */ "./node_modules/tiny-invariant/dist/tiny-invariant.esm.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * The public API for a <Router> that uses HTML5 history.
 */
var BrowserRouter =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(BrowserRouter, _React$Component);

  function BrowserRouter() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.history = (0, _history.createBrowserHistory)(_this.props);
    return _this;
  }

  var _proto = BrowserRouter.prototype;

  _proto.render = function render() {
    return _react.default.createElement(_reactRouter.Router, {
      history: this.history,
      children: this.props.children
    });
  };

  return BrowserRouter;
}(_react.default.Component);

exports.BrowserRouter = BrowserRouter;

if (true) {
  BrowserRouter.propTypes = {
    basename: _propTypes.default.string,
    children: _propTypes.default.node,
    forceRefresh: _propTypes.default.bool,
    getUserConfirmation: _propTypes.default.func,
    keyLength: _propTypes.default.number
  };

  BrowserRouter.prototype.componentDidMount = function () {
     true ? (0, _tinyWarning.default)(!this.props.history, "<BrowserRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { BrowserRouter as Router }`.") : undefined;
  };
}
/**
 * The public API for a <Router> that uses window.location.hash.
 */


var HashRouter =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(HashRouter, _React$Component);

  function HashRouter() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.history = (0, _history.createHashHistory)(_this.props);
    return _this;
  }

  var _proto = HashRouter.prototype;

  _proto.render = function render() {
    return _react.default.createElement(_reactRouter.Router, {
      history: this.history,
      children: this.props.children
    });
  };

  return HashRouter;
}(_react.default.Component);

exports.HashRouter = HashRouter;

if (true) {
  HashRouter.propTypes = {
    basename: _propTypes.default.string,
    children: _propTypes.default.node,
    getUserConfirmation: _propTypes.default.func,
    hashType: _propTypes.default.oneOf(["hashbang", "noslash", "slash"])
  };

  HashRouter.prototype.componentDidMount = function () {
     true ? (0, _tinyWarning.default)(!this.props.history, "<HashRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { HashRouter as Router }`.") : undefined;
  };
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
/**
 * The public API for rendering a history-aware <a>.
 */


var Link =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Link, _React$Component);

  function Link() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Link.prototype;

  _proto.handleClick = function handleClick(event, history) {
    try {
      if (this.props.onClick) this.props.onClick(event);
    } catch (ex) {
      event.preventDefault();
      throw ex;
    }

    if (!event.defaultPrevented && // onClick prevented default
    event.button === 0 && ( // ignore everything but left clicks
    !this.props.target || this.props.target === "_self") && // let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
        event.preventDefault();
        var method = this.props.replace ? history.replace : history.push;
        method(this.props.to);
      }
  };

  _proto.render = function render() {
    var _this = this;

    var _this$props = this.props,
        innerRef = _this$props.innerRef,
        replace = _this$props.replace,
        to = _this$props.to,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["innerRef", "replace", "to"]); // eslint-disable-line no-unused-vars

    return _react.default.createElement(_reactRouter.__RouterContext.Consumer, null, function (context) {
      !context ?  true ? (0, _tinyInvariant.default)(false, "You should not use <Link> outside a <Router>") : undefined : void 0;
      var location = typeof to === "string" ? (0, _history.createLocation)(to, null, null, context.location) : to;
      var href = location ? context.history.createHref(location) : "";
      return _react.default.createElement("a", (0, _extends2.default)({}, rest, {
        onClick: function onClick(event) {
          return _this.handleClick(event, context.history);
        },
        href: href,
        ref: innerRef
      }));
    });
  };

  return Link;
}(_react.default.Component);

exports.Link = Link;

if (true) {
  var toType = _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]);

  var innerRefType = _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func, _propTypes.default.shape({
    current: _propTypes.default.any
  })]);

  Link.propTypes = {
    innerRef: innerRefType,
    onClick: _propTypes.default.func,
    replace: _propTypes.default.bool,
    target: _propTypes.default.string,
    to: toType.isRequired
  };
}

function joinClassnames() {
  for (var _len = arguments.length, classnames = new Array(_len), _key = 0; _key < _len; _key++) {
    classnames[_key] = arguments[_key];
  }

  return classnames.filter(function (i) {
    return i;
  }).join(" ");
}
/**
 * A <Link> wrapper that knows if it's "active" or not.
 */


function NavLink(_ref) {
  var _ref$ariaCurrent = _ref["aria-current"],
      ariaCurrent = _ref$ariaCurrent === void 0 ? "page" : _ref$ariaCurrent,
      _ref$activeClassName = _ref.activeClassName,
      activeClassName = _ref$activeClassName === void 0 ? "active" : _ref$activeClassName,
      activeStyle = _ref.activeStyle,
      classNameProp = _ref.className,
      exact = _ref.exact,
      isActiveProp = _ref.isActive,
      locationProp = _ref.location,
      strict = _ref.strict,
      styleProp = _ref.style,
      to = _ref.to,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["aria-current", "activeClassName", "activeStyle", "className", "exact", "isActive", "location", "strict", "style", "to"]);
  var path = _typeof(to) === "object" ? to.pathname : to; // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202

  var escapedPath = path && path.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  return _react.default.createElement(_reactRouter.__RouterContext.Consumer, null, function (context) {
    !context ?  true ? (0, _tinyInvariant.default)(false, "You should not use <NavLink> outside a <Router>") : undefined : void 0;
    var pathToMatch = locationProp ? locationProp.pathname : context.location.pathname;
    var match = escapedPath ? (0, _reactRouter.matchPath)(pathToMatch, {
      path: escapedPath,
      exact: exact,
      strict: strict
    }) : null;
    var isActive = !!(isActiveProp ? isActiveProp(match, context.location) : match);
    var className = isActive ? joinClassnames(classNameProp, activeClassName) : classNameProp;
    var style = isActive ? (0, _extends2.default)({}, styleProp, activeStyle) : styleProp;
    return _react.default.createElement(Link, (0, _extends2.default)({
      "aria-current": isActive && ariaCurrent || null,
      className: className,
      style: style,
      to: to
    }, rest));
  });
}

if (true) {
  var ariaCurrentType = _propTypes.default.oneOf(["page", "step", "location", "date", "time", "true"]);

  NavLink.propTypes = (0, _extends2.default)({}, Link.propTypes, {
    "aria-current": ariaCurrentType,
    activeClassName: _propTypes.default.string,
    activeStyle: _propTypes.default.object,
    className: _propTypes.default.string,
    exact: _propTypes.default.bool,
    isActive: _propTypes.default.func,
    location: _propTypes.default.object,
    strict: _propTypes.default.bool,
    style: _propTypes.default.object
  });
}

/***/ }),

/***/ "./node_modules/react-router/esm/react-router.js":
/*!*******************************************************!*\
  !*** ./node_modules/react-router/esm/react-router.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Prompt = Prompt;
exports.Redirect = Redirect;
exports.generatePath = generatePath;
exports.matchPath = matchPath;
exports.withRouter = withRouter;
exports.__RouterContext = exports.Switch = exports.StaticRouter = exports.Router = exports.Route = exports.MemoryRouter = void 0;

var _miniCreateReactContext = _interopRequireDefault(__webpack_require__(/*! mini-create-react-context */ "mini-create-react-context"));

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _propTypes = _interopRequireDefault(__webpack_require__(/*! prop-types */ "prop-types"));

var _tinyWarning = _interopRequireDefault(__webpack_require__(/*! tiny-warning */ "./node_modules/tiny-warning/dist/tiny-warning.esm.js"));

var _history = __webpack_require__(/*! history */ "./node_modules/history-fix/esm/history.js");

var _tinyInvariant = _interopRequireDefault(__webpack_require__(/*! tiny-invariant */ "./node_modules/tiny-invariant/dist/tiny-invariant.esm.js"));

var _pathToRegexp = _interopRequireDefault(__webpack_require__(/*! path-to-regexp */ "./node_modules/path-to-regexp/index.js"));

var _extends2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js"));

var _reactIs = __webpack_require__(/*! react-is */ "react-is");

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutPropertiesLoose */ "./node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"));

var _hoistNonReactStatics = _interopRequireDefault(__webpack_require__(/*! hoist-non-react-statics */ "hoist-non-react-statics"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: Replace with React.createContext once we can assume React 16+
var createNamedContext = function createNamedContext(name) {
  var context = (0, _miniCreateReactContext.default)();
  context.displayName = name;
  return context;
};

var context =
/*#__PURE__*/
createNamedContext("Router");
/**
 * The public API for putting history on context.
 */

exports.__RouterContext = context;

var Router =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Router, _React$Component);

  Router.computeRootMatch = function computeRootMatch(pathname) {
    return {
      path: "/",
      url: "/",
      params: {},
      isExact: pathname === "/"
    };
  };

  function Router(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.state = {
      location: props.history.location
    }; // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.

    _this._isMounted = false;
    _this._pendingLocation = null;

    if (!props.staticContext) {
      _this.unlisten = props.history.listen(function (location) {
        if (_this._isMounted) {
          _this.setState({
            location: location
          });
        } else {
          _this._pendingLocation = location;
        }
      });
    }

    return _this;
  }

  var _proto = Router.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this._isMounted = true;

    if (this._pendingLocation) {
      this.setState({
        location: this._pendingLocation
      });
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  };

  _proto.render = function render() {
    return _react.default.createElement(context.Provider, {
      children: this.props.children || null,
      value: {
        history: this.props.history,
        location: this.state.location,
        match: Router.computeRootMatch(this.state.location.pathname),
        staticContext: this.props.staticContext
      }
    });
  };

  return Router;
}(_react.default.Component);

exports.Router = Router;

if (true) {
  Router.propTypes = {
    children: _propTypes.default.node,
    history: _propTypes.default.object.isRequired,
    staticContext: _propTypes.default.object
  };

  Router.prototype.componentDidUpdate = function (prevProps) {
     true ? (0, _tinyWarning.default)(prevProps.history === this.props.history, "You cannot change <Router history>") : undefined;
  };
}
/**
 * The public API for a <Router> that stores location in memory.
 */


var MemoryRouter =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(MemoryRouter, _React$Component);

  function MemoryRouter() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.history = (0, _history.createMemoryHistory)(_this.props);
    return _this;
  }

  var _proto = MemoryRouter.prototype;

  _proto.render = function render() {
    return _react.default.createElement(Router, {
      history: this.history,
      children: this.props.children
    });
  };

  return MemoryRouter;
}(_react.default.Component);

exports.MemoryRouter = MemoryRouter;

if (true) {
  MemoryRouter.propTypes = {
    initialEntries: _propTypes.default.array,
    initialIndex: _propTypes.default.number,
    getUserConfirmation: _propTypes.default.func,
    keyLength: _propTypes.default.number,
    children: _propTypes.default.node
  };

  MemoryRouter.prototype.componentDidMount = function () {
     true ? (0, _tinyWarning.default)(!this.props.history, "<MemoryRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { MemoryRouter as Router }`.") : undefined;
  };
}

var Lifecycle =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Lifecycle, _React$Component);

  function Lifecycle() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Lifecycle.prototype;

  _proto.componentDidMount = function componentDidMount() {
    if (this.props.onMount) this.props.onMount.call(this, this);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (this.props.onUpdate) this.props.onUpdate.call(this, this, prevProps);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.props.onUnmount) this.props.onUnmount.call(this, this);
  };

  _proto.render = function render() {
    return null;
  };

  return Lifecycle;
}(_react.default.Component);
/**
 * The public API for prompting the user before navigating away from a screen.
 */


function Prompt(_ref) {
  var message = _ref.message,
      _ref$when = _ref.when,
      when = _ref$when === void 0 ? true : _ref$when;
  return _react.default.createElement(context.Consumer, null, function (context$$1) {
    !context$$1 ?  true ? (0, _tinyInvariant.default)(false, "You should not use <Prompt> outside a <Router>") : undefined : void 0;
    if (!when || context$$1.staticContext) return null;
    var method = context$$1.history.block;
    return _react.default.createElement(Lifecycle, {
      onMount: function onMount(self) {
        self.release = method(message);
      },
      onUpdate: function onUpdate(self, prevProps) {
        if (prevProps.message !== message) {
          self.release();
          self.release = method(message);
        }
      },
      onUnmount: function onUnmount(self) {
        self.release();
      },
      message: message
    });
  });
}

if (true) {
  var messageType = _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]);

  Prompt.propTypes = {
    when: _propTypes.default.bool,
    message: messageType.isRequired
  };
}

var cache = {};
var cacheLimit = 10000;
var cacheCount = 0;

function compilePath(path) {
  if (cache[path]) return cache[path];

  var generator = _pathToRegexp.default.compile(path);

  if (cacheCount < cacheLimit) {
    cache[path] = generator;
    cacheCount++;
  }

  return generator;
}
/**
 * Public API for generating a URL pathname from a path and parameters.
 */


function generatePath(path, params) {
  if (path === void 0) {
    path = "/";
  }

  if (params === void 0) {
    params = {};
  }

  return path === "/" ? path : compilePath(path)(params, {
    pretty: true
  });
}
/**
 * The public API for navigating programmatically with a component.
 */


function Redirect(_ref) {
  var computedMatch = _ref.computedMatch,
      to = _ref.to,
      _ref$push = _ref.push,
      push = _ref$push === void 0 ? false : _ref$push;
  return _react.default.createElement(context.Consumer, null, function (context$$1) {
    !context$$1 ?  true ? (0, _tinyInvariant.default)(false, "You should not use <Redirect> outside a <Router>") : undefined : void 0;
    var history = context$$1.history,
        staticContext = context$$1.staticContext;
    var method = push ? history.push : history.replace;
    var location = (0, _history.createLocation)(computedMatch ? typeof to === "string" ? generatePath(to, computedMatch.params) : (0, _extends2.default)({}, to, {
      pathname: generatePath(to.pathname, computedMatch.params)
    }) : to); // When rendering in a static context,
    // set the new location immediately.

    if (staticContext) {
      method(location);
      return null;
    }

    return _react.default.createElement(Lifecycle, {
      onMount: function onMount() {
        method(location);
      },
      onUpdate: function onUpdate(self, prevProps) {
        var prevLocation = (0, _history.createLocation)(prevProps.to);

        if (!(0, _history.locationsAreEqual)(prevLocation, (0, _extends2.default)({}, location, {
          key: prevLocation.key
        }))) {
          method(location);
        }
      },
      to: to
    });
  });
}

if (true) {
  Redirect.propTypes = {
    push: _propTypes.default.bool,
    from: _propTypes.default.string,
    to: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]).isRequired
  };
}

var cache$1 = {};
var cacheLimit$1 = 10000;
var cacheCount$1 = 0;

function compilePath$1(path, options) {
  var cacheKey = "" + options.end + options.strict + options.sensitive;
  var pathCache = cache$1[cacheKey] || (cache$1[cacheKey] = {});
  if (pathCache[path]) return pathCache[path];
  var keys = [];
  var regexp = (0, _pathToRegexp.default)(path, keys, options);
  var result = {
    regexp: regexp,
    keys: keys
  };

  if (cacheCount$1 < cacheLimit$1) {
    pathCache[path] = result;
    cacheCount$1++;
  }

  return result;
}
/**
 * Public API for matching a URL pathname to a path.
 */


function matchPath(pathname, options) {
  if (options === void 0) {
    options = {};
  }

  if (typeof options === "string") options = {
    path: options
  };
  var _options = options,
      path = _options.path,
      _options$exact = _options.exact,
      exact = _options$exact === void 0 ? false : _options$exact,
      _options$strict = _options.strict,
      strict = _options$strict === void 0 ? false : _options$strict,
      _options$sensitive = _options.sensitive,
      sensitive = _options$sensitive === void 0 ? false : _options$sensitive;
  var paths = [].concat(path);
  return paths.reduce(function (matched, path) {
    if (!path) return null;
    if (matched) return matched;

    var _compilePath = compilePath$1(path, {
      end: exact,
      strict: strict,
      sensitive: sensitive
    }),
        regexp = _compilePath.regexp,
        keys = _compilePath.keys;

    var match = regexp.exec(pathname);
    if (!match) return null;
    var url = match[0],
        values = match.slice(1);
    var isExact = pathname === url;
    if (exact && !isExact) return null;
    return {
      path: path,
      // the path used to match
      url: path === "/" && url === "" ? "/" : url,
      // the matched portion of the URL
      isExact: isExact,
      // whether or not we matched exactly
      params: keys.reduce(function (memo, key, index) {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

function isEmptyChildren(children) {
  return _react.default.Children.count(children) === 0;
}
/**
 * The public API for matching a single path and rendering.
 */


var Route =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Route, _React$Component);

  function Route() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Route.prototype;

  _proto.render = function render() {
    var _this = this;

    return _react.default.createElement(context.Consumer, null, function (context$$1) {
      !context$$1 ?  true ? (0, _tinyInvariant.default)(false, "You should not use <Route> outside a <Router>") : undefined : void 0;
      var location = _this.props.location || context$$1.location;
      var match = _this.props.computedMatch ? _this.props.computedMatch // <Switch> already computed the match for us
      : _this.props.path ? matchPath(location.pathname, _this.props) : context$$1.match;
      var props = (0, _extends2.default)({}, context$$1, {
        location: location,
        match: match
      });
      var _this$props = _this.props,
          children = _this$props.children,
          component = _this$props.component,
          render = _this$props.render; // Preact uses an empty array as children by
      // default, so use null if that's the case.

      if (Array.isArray(children) && children.length === 0) {
        children = null;
      }

      if (typeof children === "function") {
        children = children(props);

        if (children === undefined) {
          if (true) {
            var path = _this.props.path;
             true ? (0, _tinyWarning.default)(false, "You returned `undefined` from the `children` function of " + ("<Route" + (path ? " path=\"" + path + "\"" : "") + ">, but you ") + "should have returned a React element or `null`") : undefined;
          }

          children = null;
        }
      }

      return _react.default.createElement(context.Provider, {
        value: props
      }, children && !isEmptyChildren(children) ? children : props.match ? component ? _react.default.createElement(component, props) : render ? render(props) : null : null);
    });
  };

  return Route;
}(_react.default.Component);

exports.Route = Route;

if (true) {
  Route.propTypes = {
    children: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.node]),
    component: function component(props, propName) {
      if (props[propName] && !(0, _reactIs.isValidElementType)(props[propName])) {
        return new Error("Invalid prop 'component' supplied to 'Route': the prop is not a valid React component");
      }
    },
    exact: _propTypes.default.bool,
    location: _propTypes.default.object,
    path: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.arrayOf(_propTypes.default.string)]),
    render: _propTypes.default.func,
    sensitive: _propTypes.default.bool,
    strict: _propTypes.default.bool
  };

  Route.prototype.componentDidMount = function () {
     true ? (0, _tinyWarning.default)(!(this.props.children && !isEmptyChildren(this.props.children) && this.props.component), "You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored") : undefined;
     true ? (0, _tinyWarning.default)(!(this.props.children && !isEmptyChildren(this.props.children) && this.props.render), "You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored") : undefined;
     true ? (0, _tinyWarning.default)(!(this.props.component && this.props.render), "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored") : undefined;
  };

  Route.prototype.componentDidUpdate = function (prevProps) {
     true ? (0, _tinyWarning.default)(!(this.props.location && !prevProps.location), '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.') : undefined;
     true ? (0, _tinyWarning.default)(!(!this.props.location && prevProps.location), '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.') : undefined;
  };
}

function addLeadingSlash(path) {
  return path.charAt(0) === "/" ? path : "/" + path;
}

function addBasename(basename, location) {
  if (!basename) return location;
  return (0, _extends2.default)({}, location, {
    pathname: addLeadingSlash(basename) + location.pathname
  });
}

function stripBasename(basename, location) {
  if (!basename) return location;
  var base = addLeadingSlash(basename);
  if (location.pathname.indexOf(base) !== 0) return location;
  return (0, _extends2.default)({}, location, {
    pathname: location.pathname.substr(base.length)
  });
}

function createURL(location) {
  return typeof location === "string" ? location : (0, _history.createPath)(location);
}

function staticHandler(methodName) {
  return function () {
     true ? (0, _tinyInvariant.default)(false, "You cannot %s with <StaticRouter>", methodName) : undefined;
  };
}

function noop() {}
/**
 * The public top-level API for a "static" <Router>, so-called because it
 * can't actually change the current location. Instead, it just records
 * location changes in a context object. Useful mainly in testing and
 * server-rendering scenarios.
 */


var StaticRouter =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(StaticRouter, _React$Component);

  function StaticRouter() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.handlePush = function (location) {
      return _this.navigateTo(location, "PUSH");
    };

    _this.handleReplace = function (location) {
      return _this.navigateTo(location, "REPLACE");
    };

    _this.handleListen = function () {
      return noop;
    };

    _this.handleBlock = function () {
      return noop;
    };

    return _this;
  }

  var _proto = StaticRouter.prototype;

  _proto.navigateTo = function navigateTo(location, action) {
    var _this$props = this.props,
        _this$props$basename = _this$props.basename,
        basename = _this$props$basename === void 0 ? "" : _this$props$basename,
        _this$props$context = _this$props.context,
        context = _this$props$context === void 0 ? {} : _this$props$context;
    context.action = action;
    context.location = addBasename(basename, (0, _history.createLocation)(location));
    context.url = createURL(context.location);
  };

  _proto.render = function render() {
    var _this$props2 = this.props,
        _this$props2$basename = _this$props2.basename,
        basename = _this$props2$basename === void 0 ? "" : _this$props2$basename,
        _this$props2$context = _this$props2.context,
        context = _this$props2$context === void 0 ? {} : _this$props2$context,
        _this$props2$location = _this$props2.location,
        location = _this$props2$location === void 0 ? "/" : _this$props2$location,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props2, ["basename", "context", "location"]);
    var history = {
      createHref: function createHref(path) {
        return addLeadingSlash(basename + createURL(path));
      },
      action: "POP",
      location: stripBasename(basename, (0, _history.createLocation)(location)),
      push: this.handlePush,
      replace: this.handleReplace,
      go: staticHandler("go"),
      goBack: staticHandler("goBack"),
      goForward: staticHandler("goForward"),
      listen: this.handleListen,
      block: this.handleBlock
    };
    return _react.default.createElement(Router, (0, _extends2.default)({}, rest, {
      history: history,
      staticContext: context
    }));
  };

  return StaticRouter;
}(_react.default.Component);

exports.StaticRouter = StaticRouter;

if (true) {
  StaticRouter.propTypes = {
    basename: _propTypes.default.string,
    context: _propTypes.default.object,
    location: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object])
  };

  StaticRouter.prototype.componentDidMount = function () {
     true ? (0, _tinyWarning.default)(!this.props.history, "<StaticRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { StaticRouter as Router }`.") : undefined;
  };
}
/**
 * The public API for rendering the first <Route> that matches.
 */


var Switch =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Switch, _React$Component);

  function Switch() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Switch.prototype;

  _proto.render = function render() {
    var _this = this;

    return _react.default.createElement(context.Consumer, null, function (context$$1) {
      !context$$1 ?  true ? (0, _tinyInvariant.default)(false, "You should not use <Switch> outside a <Router>") : undefined : void 0;
      var location = _this.props.location || context$$1.location;
      var element, match; // We use React.Children.forEach instead of React.Children.toArray().find()
      // here because toArray adds keys to all child elements and we do not want
      // to trigger an unmount/remount for two <Route>s that render the same
      // component at different URLs.

      _react.default.Children.forEach(_this.props.children, function (child) {
        if (match == null && _react.default.isValidElement(child)) {
          element = child;
          var path = child.props.path || child.props.from;
          match = path ? matchPath(location.pathname, (0, _extends2.default)({}, child.props, {
            path: path
          })) : context$$1.match;
        }
      });

      return match ? _react.default.cloneElement(element, {
        location: location,
        computedMatch: match
      }) : null;
    });
  };

  return Switch;
}(_react.default.Component);

exports.Switch = Switch;

if (true) {
  Switch.propTypes = {
    children: _propTypes.default.node,
    location: _propTypes.default.object
  };

  Switch.prototype.componentDidUpdate = function (prevProps) {
     true ? (0, _tinyWarning.default)(!(this.props.location && !prevProps.location), '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.') : undefined;
     true ? (0, _tinyWarning.default)(!(!this.props.location && prevProps.location), '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.') : undefined;
  };
}
/**
 * A public higher-order component to access the imperative API
 */


function withRouter(Component) {
  var displayName = "withRouter(" + (Component.displayName || Component.name) + ")";

  var C = function C(props) {
    var wrappedComponentRef = props.wrappedComponentRef,
        remainingProps = (0, _objectWithoutPropertiesLoose2.default)(props, ["wrappedComponentRef"]);
    return _react.default.createElement(context.Consumer, null, function (context$$1) {
      !context$$1 ?  true ? (0, _tinyInvariant.default)(false, "You should not use <" + displayName + " /> outside a <Router>") : undefined : void 0;
      return _react.default.createElement(Component, (0, _extends2.default)({}, remainingProps, context$$1, {
        ref: wrappedComponentRef
      }));
    });
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;

  if (true) {
    C.propTypes = {
      wrappedComponentRef: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func, _propTypes.default.object])
    };
  }

  return (0, _hoistNonReactStatics.default)(C, Component);
}

if (true) {
  if (typeof window !== "undefined") {
    var global = window;
    var key = "__react_router_build__";
    var buildNames = {
      cjs: "CommonJS",
      esm: "ES modules",
      umd: "UMD"
    };

    if (global[key] && global[key] !== "esm") {
      var initialBuildName = buildNames[global[key]];
      var secondaryBuildName = buildNames["esm"]; // TODO: Add link to article that explains in detail how to avoid
      // loading 2 different builds.

      throw new Error("You are loading the " + secondaryBuildName + " build of React Router " + ("on a page that is already running the " + initialBuildName + " ") + "build, so things won't work right.");
    }

    global[key] = "esm";
  }
}

/***/ }),

/***/ "./node_modules/resolve-pathname/index.js":
/*!************************************************!*\
  !*** ./node_modules/resolve-pathname/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
} // About 1.5x faster than the two-arg version of Array#splice()


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
} // This implementation is based heavily on node's url.parse


function resolvePathname(to) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];
  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';
  var hasTrailingSlash = void 0;

  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;

  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) {
    fromParts.unshift('..');
  }
  if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
  var result = fromParts.join('/');
  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
  return result;
}

var _default = resolvePathname;
exports.default = _default;

/***/ }),

/***/ "./node_modules/tiny-invariant/dist/tiny-invariant.esm.js":
/*!****************************************************************!*\
  !*** ./node_modules/tiny-invariant/dist/tiny-invariant.esm.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var isProduction = "development" === 'production';
var prefix = 'Invariant failed';

function invariant(condition, message) {
  if (condition) {
    return;
  }

  if (isProduction) {
    throw new Error(prefix);
  } else {
    throw new Error(prefix + ": " + (message || ''));
  }
}

var _default = invariant;
exports.default = _default;

/***/ }),

/***/ "./node_modules/tiny-warning/dist/tiny-warning.esm.js":
/*!************************************************************!*\
  !*** ./node_modules/tiny-warning/dist/tiny-warning.esm.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var isProduction = "development" === 'production';

function warning(condition, message) {
  if (!isProduction) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

var _default = warning;
exports.default = _default;

/***/ }),

/***/ "./node_modules/value-equal/index.js":
/*!*******************************************!*\
  !*** ./node_modules/value-equal/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
};

function valueEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
      return valueEqual(item, b[index]);
    });
  }

  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);
  if (aType !== bType) return false;

  if (aType === 'object') {
    var aValue = a.valueOf();
    var bValue = b.valueOf();
    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(function (key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
}

var _default = valueEqual;
exports.default = _default;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RouterLink: true,
  RouterView: true,
  useRouteGuards: true
};
Object.defineProperty(exports, "RouterLink", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.NavLink;
  }
});
Object.defineProperty(exports, "RouterView", {
  enumerable: true,
  get: function get() {
    return _routerView.default;
  }
});
Object.defineProperty(exports, "useRouteGuards", {
  enumerable: true,
  get: function get() {
    return _routeGuard.useRouteGuards;
  }
});
exports.default = void 0;

var _router = _interopRequireDefault(__webpack_require__(/*! ./router */ "./src/router.js"));

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/esm/react-router-dom.js");

var _routerView = _interopRequireDefault(__webpack_require__(/*! ./router-view */ "./src/router-view.js"));

var _routeGuard = __webpack_require__(/*! ./route-guard */ "./src/route-guard.js");

var _util = __webpack_require__(/*! ./util */ "./src/util.js");

Object.keys(_util).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _util[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _router.default;
exports.default = _default;

/***/ }),

/***/ "./src/qs.js":
/*!*******************!*\
  !*** ./src/qs.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var encodeReserveRE = /[!'()*]/g;

var encodeReserveReplacer = function encodeReserveReplacer(c) {
  return '%' + c.charCodeAt(0).toString(16);
};

var commaRE = /%2C/g; // fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas

var encode = function encode(str) {
  return encodeURIComponent(str).replace(encodeReserveRE, encodeReserveReplacer).replace(commaRE, ',');
};

var decode = decodeURIComponent;

function _parseQuery(query) {
  var res = {};
  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0 ? decode(parts.join('=')) : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });
  return res;
}

function _stringifyQuery(obj) {
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];

    if (val === undefined) {
      return '';
    }

    if (val === null) {
      return encode(key);
    }

    if (Array.isArray(val)) {
      var result = [];
      val.forEach(function (val2) {
        if (val2 === undefined) {
          return;
        }

        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&');
    }

    return encode(key) + '=' + encode(val);
  }).filter(function (x) {
    return x.length > 0;
  }).join('&') : null;
  return res ? "?".concat(res) : '';
}

var _default = {
  _parseQuery: _parseQuery,
  _stringifyQuery: _stringifyQuery,
  parseQuery: _parseQuery,
  stringifyQuery: _stringifyQuery
};
exports.default = _default;

/***/ }),

/***/ "./src/route-guard.js":
/*!****************************!*\
  !*** ./src/route-guard.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRouteGuards = useRouteGuards;
exports.RouteCuards = exports.RouteComponentGuards = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RouteComponentGuards =
/*#__PURE__*/
function () {
  function RouteComponentGuards(component, guards) {
    _classCallCheck(this, RouteComponentGuards);

    this.component = component;
    this.guards = guards;
  }

  _createClass(RouteComponentGuards, [{
    key: "render",
    value: function render(props) {
      return _react.default.createElement(this.component, props);
    }
  }]);

  return RouteComponentGuards;
}();

exports.RouteComponentGuards = RouteComponentGuards;

var RouteCuards =
/*#__PURE__*/
function () {
  function RouteCuards(guards) {
    var _this = this;

    _classCallCheck(this, RouteCuards);

    this.beforeRouteEnter = [];
    this.beforeRouteUpdate = [];
    this.beforeRouteLeave = [];
    this.afterRouteLeave = [];
    Object.keys(guards).forEach(function (key) {
      return _this[key] && _this[key].push(guards[key]);
    });
  }

  _createClass(RouteCuards, [{
    key: "merge",
    value: function merge(guards) {
      var _this2 = this;

      Object.keys(guards).forEach(function (key) {
        var _this2$key;

        if (!_this2[key]) return;
        if (guards[key]) (_this2$key = _this2[key]).push.apply(_this2$key, _toConsumableArray(guards[key]));
      });
    }
  }]);

  return RouteCuards;
}();

exports.RouteCuards = RouteCuards;

function useRouteGuards(component) {
  var guards = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new RouteComponentGuards(component, new RouteCuards(guards || {}));
}

/***/ }),

/***/ "./src/router-view.js":
/*!****************************!*\
  !*** ./src/router-view.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js"));

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/esm/react-router-dom.js");

var _util = __webpack_require__(/*! ./util */ "./src/util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RouterView =
/*#__PURE__*/
function (_React$Component) {
  _inherits(RouterView, _React$Component);

  function RouterView(props) {
    var _this;

    _classCallCheck(this, RouterView);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RouterView).call(this, props));
    var router = props && props.router;
    var depth = Number(props && props.depth) || 0;
    var state = {
      _routerView: _assertThisInitialized(_this),
      _routerRoot: true,
      _routerParent: null,
      _routerDepth: depth,
      _routerInited: false,
      router: router,
      parentRoute: null,
      routes: router ? _this.filterRoutes(router.routes) : []
    };
    _this.state = state;
    _this._updateRef = _this._updateRef.bind(_assertThisInitialized(_this));
    _this.filterRoutes = _this.filterRoutes.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(RouterView, [{
    key: "_updateRef",
    value: function _updateRef(ref) {
      var parentRoute = this.state.parentRoute;
      if (parentRoute) parentRoute.componentInstance = ref;
      if (this.props && this.props._updateRef) this.props._updateRef(ref);
    }
  }, {
    key: "filterRoutes",
    value: function filterRoutes(routes) {
      var name = this.props.name;
      return routes.filter(function (r) {
        if (r.config) r = r.config;
        var hasName = name && name !== 'default';
        if (r.redirect) return hasName ? name === r.name : !r.name;
        return hasName ? r.components && r.components[name] : r.component || r.components && r.components.default;
      });
    }
  }, {
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var _this2 = this;

        var state, props, parent, memoizedState, matched;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.state._routerInited) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                state = _objectSpread({}, this.state, {
                  _routerInited: true
                });
                props = this.props || {};

                if (!(props.depth === undefined && this._reactInternalFiber)) {
                  _context.next = 17;
                  break;
                }

                parent = this._reactInternalFiber.return;

              case 6:
                if (!parent) {
                  _context.next = 17;
                  break;
                }

                memoizedState = parent.memoizedState;

                if (!(memoizedState && memoizedState._routerView)) {
                  _context.next = 14;
                  break;
                }

                state._routerRoot = false;
                state._routerParent = memoizedState._routerView;
                if (!state.router) state.router = memoizedState.router;
                state._routerDepth = memoizedState._routerDepth + 1;
                return _context.abrupt("break", 17);

              case 14:
                parent = parent.return;
                _context.next = 6;
                break;

              case 17:
                if (!state.routes.length && state._routerDepth) {
                  // state.router.updateRoute();
                  matched = state.router.currentRoute.matched;
                  state.parentRoute = matched.length > state._routerDepth ? matched[state._routerDepth - 1] : null;

                  if (state.parentRoute) {
                    state.parentRoute.viewInstance = this;
                  }

                  state.routes = state.parentRoute ? this.filterRoutes(state.parentRoute.config.children) : [];
                }

                if (state._routerRoot && state.router) {
                  state.router._handleRouteInterceptor(state.router.location, function (ok) {
                    return ok && _this2.setState(state);
                  });
                } else this.setState(state);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !nextProps.location || nextProps.location.pathname !== this.props.location.pathname;
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$state = this.state,
          routes = _this$state.routes,
          router = _this$state.router,
          _routerRoot = _this$state._routerRoot,
          _routerInited = _this$state._routerInited;

      var _ref = this.props || {},
          _updateRef = _ref._updateRef,
          props = _objectWithoutProperties(_ref, ["_updateRef"]);

      if (!_routerInited) return props.fallback || null;
      var _router$currentRoute = router.currentRoute,
          query = _router$currentRoute.query,
          params = _router$currentRoute.params;

      var _render = function _render() {
        return (0, _util.renderRoutes)(routes, _objectSpread({}, props, {
          parent: _this3,
          ref: _updateRef ? _this3._updateRef : undefined
        }), {}, {
          name: props.name,
          query: query,
          params: params
        });
      };

      var ret = null;

      if (_routerRoot) {
        ret = _react.default.createElement(_reactRouterDom.Router, {
          history: router
        }, _render());
      } else ret = _render();

      return ret;
    }
  }]);

  return RouterView;
}(_react.default.Component);

var _default = _react.default.forwardRef(function (props, ref) {
  return _react.default.createElement(RouterView, _objectSpread({}, props, {
    _updateRef: ref
  }));
});

exports.default = _default;

/***/ }),

/***/ "./src/router.js":
/*!***********************!*\
  !*** ./src/router.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routetInterceptors = routetInterceptors;
exports.default = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js"));

var _historyFix = __webpack_require__(/*! history-fix */ "./node_modules/history-fix/esm/history.js");

var _qs = _interopRequireDefault(__webpack_require__(/*! ./qs */ "./src/qs.js"));

var _util = __webpack_require__(/*! ./util */ "./src/util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function routetInterceptors(_x, _x2, _x3, _x4) {
  return _routetInterceptors.apply(this, arguments);
}

function _routetInterceptors() {
  _routetInterceptors = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(interceptors, to, from, next) {
    var routetInterceptor, _routetInterceptor, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, interceptor;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _routetInterceptor = function _ref4() {
              _routetInterceptor = _asyncToGenerator(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee3(interceptor, index, to, from, next) {
                return _regenerator.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        if (interceptor) {
                          _context3.next = 4;
                          break;
                        }

                        _context3.next = 3;
                        return next();

                      case 3:
                        return _context3.abrupt("return", _context3.sent);

                      case 4:
                        _context3.next = 6;
                        return interceptor(to, from,
                        /*#__PURE__*/
                        function () {
                          var _ref2 = _asyncToGenerator(
                          /*#__PURE__*/
                          _regenerator.default.mark(function _callee2(f1) {
                            return _regenerator.default.wrap(function _callee2$(_context2) {
                              while (1) {
                                switch (_context2.prev = _context2.next) {
                                  case 0:
                                    if (!(f1 !== undefined && f1 !== true && typeof f1 !== 'function')) {
                                      _context2.next = 4;
                                      break;
                                    }

                                    _context2.next = 3;
                                    return next(f1);

                                  case 3:
                                    return _context2.abrupt("return", _context2.sent);

                                  case 4:
                                    if (typeof f1 === 'boolean') f1 = undefined;
                                    interceptor = interceptors[++index];

                                    if (!interceptor) {
                                      _context2.next = 12;
                                      break;
                                    }

                                    _context2.next = 9;
                                    return routetInterceptor(interceptor, index, to, from, function (f2) {
                                      return next(function (res) {
                                        return (0, _util.isFunction)(f2) && f2(res) || (0, _util.isFunction)(f1) && f1(res);
                                      });
                                    });

                                  case 9:
                                    _context2.t0 = _context2.sent;
                                    _context2.next = 15;
                                    break;

                                  case 12:
                                    _context2.next = 14;
                                    return next(function (res) {
                                      return (0, _util.isFunction)(f1) && f1(res);
                                    });

                                  case 14:
                                    _context2.t0 = _context2.sent;

                                  case 15:
                                    return _context2.abrupt("return", _context2.t0);

                                  case 16:
                                  case "end":
                                    return _context2.stop();
                                }
                              }
                            }, _callee2);
                          }));

                          return function (_x12) {
                            return _ref2.apply(this, arguments);
                          };
                        }());

                      case 6:
                        return _context3.abrupt("return", _context3.sent);

                      case 7:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));
              return _routetInterceptor.apply(this, arguments);
            };

            routetInterceptor = function _ref3(_x7, _x8, _x9, _x10, _x11) {
              return _routetInterceptor.apply(this, arguments);
            };

            if (!next) {
              _context4.next = 6;
              break;
            }

            _context4.next = 5;
            return routetInterceptor(interceptors[0], 0, to, from, function (f) {
              return (0, _util.isFunction)(f) ? next(function (res) {
                return f && f(res);
              }) : next(f);
            });

          case 5:
            return _context4.abrupt("return", _context4.sent);

          case 6:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 9;
            _iterator = interceptors[Symbol.iterator]();

          case 11:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 20;
              break;
            }

            interceptor = _step.value;
            _context4.t0 = interceptor;

            if (!_context4.t0) {
              _context4.next = 17;
              break;
            }

            _context4.next = 17;
            return interceptor(to, from);

          case 17:
            _iteratorNormalCompletion = true;
            _context4.next = 11;
            break;

          case 20:
            _context4.next = 26;
            break;

          case 22:
            _context4.prev = 22;
            _context4.t1 = _context4["catch"](9);
            _didIteratorError = true;
            _iteratorError = _context4.t1;

          case 26:
            _context4.prev = 26;
            _context4.prev = 27;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 29:
            _context4.prev = 29;

            if (!_didIteratorError) {
              _context4.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context4.finish(29);

          case 33:
            return _context4.finish(26);

          case 34:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[9, 22, 26, 34], [27,, 29, 33]]);
  }));
  return _routetInterceptors.apply(this, arguments);
}

var HISTORY_METHODS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

var ReactViewRouter =
/*#__PURE__*/
function () {
  function ReactViewRouter() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ReactViewRouter);

    if (!options.mode) options.mode = 'hash';
    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);
    if (options.base) options.basename = options.base;

    switch (options.mode) {
      case 'browser':
      case 'history':
        this.history = (0, _historyFix.createBrowserHistory)(options);
        break;

      case 'memory':
      case 'abstract':
        this.history = (0, _historyFix.createMemoryHistory)(options);
        break;

      default:
        this.history = (0, _historyFix.createHashHistory)(options);
    }

    this.routes = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.history.listen(function (location) {
      return _this.updateRoute(location);
    });
    this.history.block(function (location) {
      return _util.routeCache.create(location);
    });
    Object.keys(this.history).forEach(function (key) {
      return !HISTORY_METHODS.includes(key) && (_this[key] = _this.history[key]);
    });
    HISTORY_METHODS.forEach(function (key) {
      return _this[key] && (_this[key] = _this[key].bind(_this));
    });
    this.use(options);
  }

  _createClass(ReactViewRouter, [{
    key: "use",
    value: function use(_ref) {
      var routes = _ref.routes,
          parseQuery = _ref.parseQuery,
          stringifyQuery = _ref.stringifyQuery;

      if (routes) {
        this.routes = routes ? (0, _util.normalizeRoutes)(routes) : [];
        this.updateRoute(this.history.location);
      }

      if (parseQuery) _qs.default.parseQuery = parseQuery;
      if (stringifyQuery) _qs.default.stringifyQuery = stringifyQuery;
    }
  }, {
    key: "_getComponentGurads",
    value: function _getComponentGurads(r, guardName) {
      var ret = [];
      if (r.config) r = r.config;
      if (!r.routeGuards || !r.routeGuards[guardName] || !r.routeGuards[guardName].length) return ret;
      ret.push.apply(ret, _toConsumableArray(r.routeGuards[guardName]));
      return ret;
    }
  }, {
    key: "_getRouteComponentGurads",
    value: function _getRouteComponentGurads(route, guardName) {
      var _this2 = this;

      var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var ret = [];
      route.matched.forEach(function (r) {
        return ret.push.apply(ret, _toConsumableArray(_this2._getComponentGurads(r, guardName)));
      });
      return reverse ? ret.reverse() : ret;
    }
  }, {
    key: "_getBeforeEachGuards",
    value: function _getBeforeEachGuards(to, from) {
      var ret = [];

      if (from) {
        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(from, 'beforeRouteLeave', true)));
        ret.push.apply(ret, _toConsumableArray(from.matched.filter(function (r) {
          return r.config.beforeLeave;
        }).map(function (r) {
          return r.config.beforeLeave;
        }).reverse()));
      }

      if (to) {
        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(to, 'beforeRouteEnter')));
        ret.push.apply(ret, _toConsumableArray(to.matched.filter(function (r) {
          return r.config.beforeEnter;
        }).map(function (r) {
          return r.config.beforeEnter;
        })));
      }

      ret.push.apply(ret, _toConsumableArray(this.beforeEachGuards));
      return ret;
    }
  }, {
    key: "_getAfterEachGuards",
    value: function _getAfterEachGuards(to, from) {
      var ret = [];

      if (from) {
        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(from, 'afterRouteLeave', true)));
        ret.push.apply(ret, _toConsumableArray(from.matched.filter(function (r) {
          return r.config.afterLeave;
        }).map(function (r) {
          return r.config.afterLeave;
        }).reverse()));
      }

      if (to) {
        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(from, 'afterRouteEnter')));
        ret.push.apply(ret, _toConsumableArray(from.matched.filter(function (r) {
          return r.config.afterEnter;
        }).map(function (r) {
          return r.config.afterEnter;
        })));
      }

      ret.push.apply(ret, _toConsumableArray(this.afterEachGuards));
      return ret;
    }
  }, {
    key: "_getRouteUpdateGuards",
    value: function _getRouteUpdateGuards(to, from) {
      var _this3 = this;

      var ret = [];
      to.matched.some(function (tr, i) {
        var fr = from.matched[i];
        if (!fr || fr.path !== tr.path) return true;
        ret.push.apply(ret, _toConsumableArray(_this3._getComponentGurads(tr, 'beforeRouteUpdate')));
      });
      return ret;
    }
  }, {
    key: "_handleRouteInterceptor",
    value: function () {
      var _handleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(location, callback) {
        var _this4 = this;

        var isContinue, to, from;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (typeof location === 'string') location = _util.routeCache.flush(location);

                if (location) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", callback(true));

              case 3:
                isContinue = false;
                _context.prev = 4;
                to = this._createRoute(location);
                from = this.currentRoute;
                _context.next = 9;
                return (0, _util.resolveRouteLazyList)(to && to.matched);

              case 9:
                routetInterceptors(this._getBeforeEachGuards(to, from), to, from, function (ok) {
                  if (ok && typeof ok === 'string') ok = {
                    path: ok
                  };
                  isContinue = Boolean(ok === undefined || ok && !(0, _util.isLocation)(ok));
                  callback(isContinue);

                  if (!isContinue) {
                    if ((0, _util.isLocation)(ok)) _this4.replace(ok);
                    if (to && (0, _util.isFunction)(to.onAbort)) to.onAbort((0, _util.isLocation)(ok) ? ok : undefined);
                    return;
                  }

                  if ((0, _util.isFunction)(ok)) ok(to);
                  if (to && (0, _util.isFunction)(to.onComplete)) to.onComplete();
                  routetInterceptors(_this4._getAfterEachGuards(to, from), to, from);
                  routetInterceptors(_this4._getRouteUpdateGuards(to, from), to, from);
                });
                _context.next = 16;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](4);
                console.error(_context.t0);
                if (!isContinue) callback(isContinue);

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 12]]);
      }));

      function _handleRouteInterceptor(_x5, _x6) {
        return _handleRouteInterceptor2.apply(this, arguments);
      }

      return _handleRouteInterceptor;
    }()
  }, {
    key: "_createRoute",
    value: function _createRoute(location) {
      var matched = (0, _util.matchRoutes)(this.routes, location.pathname);
      var last = matched.length ? matched[matched.length - 1] : null;
      return last ? _objectSpread({}, last.match, {
        query: location.search ? _qs.default.parseQuery(location.search.substr(1)) : {},
        path: location.pathname,
        matched: matched.map(function (v) {
          var ret = {};
          Object.keys(v.route).forEach(function (key) {
            return ['path', 'name', 'subpath', 'meta', 'redirect', 'alias'].includes(key) && (ret[key] = v.route[key]);
          });
          ret.config = v.route;
          return ret;
        }),
        meta: last.route.meta || {}
      }) : null;
    }
  }, {
    key: "updateRoute",
    value: function updateRoute(location) {
      if (!location) location = this.history.location;
      this.currentRoute = this._createRoute(location);
    }
  }, {
    key: "push",
    value: function push(location, onComplete, onAbort) {
      if ((0, _util.isFunction)(onComplete)) location.onComplete = onComplete;
      if ((0, _util.isFunction)(onAbort)) location.onAbort = onAbort;
      this.history.push((0, _util.normalizeLocation)(location));
    }
  }, {
    key: "replace",
    value: function replace(location, onComplete, onAbort) {
      if ((0, _util.isFunction)(onComplete)) location.onComplete = onComplete;
      if ((0, _util.isFunction)(onAbort)) location.onAbort = onAbort;
      this.history.replace((0, _util.normalizeLocation)(location));
    }
  }, {
    key: "go",
    value: function go(n) {
      return this.history.go(n);
    }
  }, {
    key: "back",
    value: function back() {
      return this.history.goBack();
    }
  }, {
    key: "goBack",
    value: function goBack() {
      return this.history.goBack();
    }
  }, {
    key: "forward",
    value: function forward() {
      return this.history.goForward();
    }
  }, {
    key: "goForward",
    value: function goForward() {
      return this.history.goForward();
    }
  }, {
    key: "beforeEach",
    value: function beforeEach(guard) {
      if (!guard || typeof guard !== 'function') return;
      var i = this.beforeEachGuards.indexOf(guard);
      if (~i) this.beforeEachGuards.splice(i, 1);
      this.beforeEachGuards.push(guard);
    }
  }, {
    key: "afterEach",
    value: function afterEach(guard) {
      if (!guard || typeof guard !== 'function') return;
      var i = this.afterEachGuards.indexOf(guard);
      if (~i) this.afterEachGuards.splice(i, 1);
      this.afterEachGuards.push(guard);
    }
  }, {
    key: "addRoutes",
    value: function addRoutes(children, parentRoute) {
      if (!children) return;
      if (!parentRoute) parentRoute = {
        children: this.routes
      };
      if (!parentRoute.children) parentRoute.children = [];
      if (!Array.isArray(children)) children = [children];
      children = (0, _util.normalizeRoutes)(children, parentRoute);
      children.forEach(function (r) {
        var i = parentRoute.children.findIndex(function (v) {
          return v.path === r.path;
        });
        if (~i) parentRoute.children.splice(i, 1, r);else parentRoute.children.push(r);
      });
    }
  }, {
    key: "parseQuery",
    value: function parseQuery(query) {
      return _qs.default.parseQuery(query);
    }
  }, {
    key: "stringifyQuery",
    value: function stringifyQuery(obj) {
      return _qs.default.stringifyQuery(obj);
    }
  }]);

  return ReactViewRouter;
}();

exports.default = ReactViewRouter;

/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveRouteLazyList = resolveRouteLazyList;
exports.lazyImport = lazyImport;
exports.resolveRouteGuards = resolveRouteGuards;
exports.isPlainObject = isPlainObject;
exports.isFunction = isFunction;
exports.isLocation = isLocation;
exports.normalizeRoutes = normalizeRoutes;
exports.normalizeRoutePath = normalizeRoutePath;
exports.normalizeLocation = normalizeLocation;
exports.normalizeProps = normalizeProps;
exports.matchRoutes = matchRoutes;
exports.renderRoutes = renderRoutes;
Object.defineProperty(exports, "matchPath", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.matchPath;
  }
});
Object.defineProperty(exports, "withRouter", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.withRouter;
  }
});
exports.RouteLazy = exports.routeCache = void 0;

var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js"));

var _reactRouterDom = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/esm/react-router-dom.js");

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _qs = _interopRequireDefault(__webpack_require__(/*! ./qs */ "./src/qs.js"));

var _routeGuard = __webpack_require__(/*! ./route-guard */ "./src/route-guard.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RouterCache =
/*#__PURE__*/
function () {
  function RouterCache() {
    _classCallCheck(this, RouterCache);

    this.cached = {};
    this.seed = 0;
  }

  _createClass(RouterCache, [{
    key: "create",
    value: function create(data) {
      var key = "[route_cache_id:".concat(++this.seed, "]");
      this.cached[key] = data;
      return key;
    }
  }, {
    key: "flush",
    value: function flush(seed) {
      if (!seed) return;
      var ret = this.cached[seed];
      delete this.cached[seed];
      return ret;
    }
  }]);

  return RouterCache;
}();

var routeCache = new RouterCache();
exports.routeCache = routeCache;

var RouteLazy =
/*#__PURE__*/
function () {
  function RouteLazy(importMethod) {
    _classCallCheck(this, RouteLazy);

    this.importMethod = importMethod;
    this.resolved = false;
    this.updater = null;
  }

  _createClass(RouteLazy, [{
    key: "toResolve",
    value: function toResolve() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var _resolve = function _resolve(v) {
          if (_this.updater) v = _this.updater(v) || v;
          _this.resolved = true;
          resolve(v);
        };

        var component = _this.importMethod();

        if (component instanceof Promise) {
          component.then(function (c) {
            component = c.__esModule ? c.default : c;
            return _resolve(component);
          }).catch(function () {
            return reject(arguments);
          });
        } else _resolve(component);
      });
    }
  }]);

  return RouteLazy;
}();

exports.RouteLazy = RouteLazy;

function resolveRouteLazyList(_x) {
  return _resolveRouteLazyList.apply(this, arguments);
}

function _resolveRouteLazyList() {
  _resolveRouteLazyList = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(matched) {
    var toResolve, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, r, config, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, key;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (matched) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            toResolve = function toResolve(routeLazy) {
              if (!routeLazy || !(routeLazy instanceof RouteLazy)) return;
              return routeLazy.toResolve();
            };

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 6;
            _iterator2 = matched[Symbol.iterator]();

          case 8:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 43;
              break;
            }

            r = _step2.value;
            config = r.config;
            _context.next = 13;
            return toResolve(config.component, config);

          case 13:
            if (!config.components) {
              _context.next = 40;
              break;
            }

            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context.prev = 17;
            _iterator3 = config.components[Symbol.iterator]();

          case 19:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context.next = 26;
              break;
            }

            key = _step3.value;
            _context.next = 23;
            return toResolve(config.components[key], config);

          case 23:
            _iteratorNormalCompletion3 = true;
            _context.next = 19;
            break;

          case 26:
            _context.next = 32;
            break;

          case 28:
            _context.prev = 28;
            _context.t0 = _context["catch"](17);
            _didIteratorError3 = true;
            _iteratorError3 = _context.t0;

          case 32:
            _context.prev = 32;
            _context.prev = 33;

            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }

          case 35:
            _context.prev = 35;

            if (!_didIteratorError3) {
              _context.next = 38;
              break;
            }

            throw _iteratorError3;

          case 38:
            return _context.finish(35);

          case 39:
            return _context.finish(32);

          case 40:
            _iteratorNormalCompletion2 = true;
            _context.next = 8;
            break;

          case 43:
            _context.next = 49;
            break;

          case 45:
            _context.prev = 45;
            _context.t1 = _context["catch"](6);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 49:
            _context.prev = 49;
            _context.prev = 50;

            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }

          case 52:
            _context.prev = 52;

            if (!_didIteratorError2) {
              _context.next = 55;
              break;
            }

            throw _iteratorError2;

          case 55:
            return _context.finish(52);

          case 56:
            return _context.finish(49);

          case 57:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[6, 45, 49, 57], [17, 28, 32, 40], [33,, 35, 39], [50,, 52, 56]]);
  }));
  return _resolveRouteLazyList.apply(this, arguments);
}

function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}

function resolveRouteGuards(c, route) {
  if (c instanceof _routeGuard.RouteComponentGuards) {
    if (route) {
      if (route.routeGuards) route.routeGuards.merge(c.guards);else route.routeGuards = c.guards;
    }

    c = c.component;
  }

  return c;
}

function normalizeRoutes(routes, parent) {
  if (!routes) routes = [];
  if (routes._normalized) return routes;
  var ret = routes.map(function (route, routeIndex) {
    if (route instanceof RouteLazy) {
      route.updater = function (r) {
        return routes[routeIndex] = r;
      };

      return;
    }

    var r = _objectSpread({}, route, {
      subpath: route.path
    });

    r.path = parent ? "".concat(parent.path).concat(r.path === '/' ? '' : "/".concat(r.path)) : r.path;
    if (parent) r.parent = parent;
    if (r.children) r.children = normalizeRoutes(r.children, r);
    if (r.exact === undefined && r.redirect) r.exact = true;

    if (r.component instanceof RouteLazy) {
      r.component.updater = function (c) {
        return r.component = resolveRouteGuards(c, r);
      };
    }

    if (r.components) {
      Object.keys(r.components).forEach(function (key) {
        var comp = r.components[key];

        if (comp instanceof RouteLazy) {
          comp.updater = function (c) {
            return r.components[key] = resolveRouteGuards(c, r);
          };
        }
      });
    }

    if (r.props) r.props = normalizeProps(r.props);
    if (r.paramsProps) r.paramsProps = normalizeProps(r.paramsProps);
    if (r.queryProps) r.queryProps = normalizeProps(r.queryProps);
    return r;
  });
  Object.defineProperty(ret, '_normalized', {
    enumerable: false,
    configurable: false,
    value: true
  });
  return ret;
}

function normalizeRoutePath(route, path) {
  if (!path || path[0] === '/') return path;
  var parent = route.parent;

  while (parent && path[0] !== '/') {
    path = "".concat(parent.path, "/").concat(path);
    parent = route.parent;
  }

  return path;
}

function matchRoutes(routes, pathname, branch) {
  if (branch === undefined) branch = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var route = _step.value;
      var match = route.path ? (0, _reactRouterDom.matchPath)(pathname, route) : branch.length ? branch[branch.length - 1].match // use parent match
      : _reactRouterDom.Router.computeRootMatch(pathname); // use default "root" match

      if (match) {
        branch.push({
          route: route,
          match: match
        });
        if (route.children) matchRoutes(route.children, pathname, branch);
      }

      if (match) break;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return branch;
}

function normalizeLocation(location) {
  if (typeof location === 'string') location = {
    path: location
  };

  var _location = location,
      path = _location.path,
      pathname = _location.pathname,
      query = _location.query,
      search = _location.search,
      others = _objectWithoutProperties(_location, ["path", "pathname", "query", "search"]);

  return _objectSpread({
    pathname: path || pathname,
    search: query ? _qs.default.stringifyQuery(query) : search || ''
  }, others);
}

var _toString = Object.prototype.toString;

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isFunction(value) {
  return typeof value === 'function';
}

function isLocation(v) {
  return isPlainObject(v) && (v.path || v.pathname);
}

function normalizeProps(props) {
  var res = {};

  if (Array.isArray(props)) {
    props.forEach(function (key) {
      return res[key] = {
        type: null
      };
    });
  } else if (isPlainObject(props)) {
    Object.keys(props).forEach(function (key) {
      var val = props[key];
      res[key] = isPlainObject(val) ? val.type !== undefined ? val : normalizeProps(val) : {
        type: val
      };
    });
  } else return props;

  return res;
}

function renderRoutes(routes, extraProps, switchProps) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if (extraProps === undefined) extraProps = {};
  if (switchProps === undefined) switchProps = {};

  function getRouteComp(route) {
    if (options.name) return route.components && route.renderComponent[options.name];
    return route.component || route.components && route.components.default;
  }

  function configProps(_props, configs, obj, name) {
    if (!obj) return;
    if (name && configs[name] !== undefined) configs = configs[name];
    if (configs === true) _props = obj ? _objectSpread({}, obj) : {};else if (isPlainObject(configs)) {
      Object.keys(configs).forEach(function (key) {
        var prop = configs[key];
        var type = prop.type;
        var val = obj[key];

        if (val === undefined) {
          if (prop.default) {
            if (typeof prop.default === 'function' && (type === Object || type === Array)) {
              _props[key] = prop.default();
            } else _props[key] = prop.default;
          } else return;
        }

        if (type !== null) _props[key] = type(val);else _props[key] = val;
      });
    }
  }

  function renderComp(route, component, props, options) {
    if (!component) return null;
    var _props = {};
    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);
    if (route.render) return route.render(Object.assign(_props, props, extraProps, {
      route: route
    }));
    component = resolveRouteGuards(component, route);

    var ret = _react.default.createElement(component, Object.assign(_props, props, extraProps, {
      route: route
    })); // console.log('renderComp', route, ret);


    return ret;
  }

  var ret = routes ? _react.default.createElement(_reactRouterDom.Switch, switchProps, routes.map(function (route, i) {
    var exact = route.exact === undefined ? Boolean(!route.children || !route.children.length) : route.exact;

    if (route.redirect) {
      var to = route.redirect;
      if (typeof to === 'function') to = to(Object.assign({}, extraProps, {
        route: route
      }));
      to = normalizeLocation(to);
      to.pathname = normalizeRoutePath(route, to.pathname);
      return _react.default.createElement(_reactRouterDom.Redirect, {
        key: route.key || i,
        exact: exact,
        strict: route.strict,
        from: route.path,
        to: to
      });
    }

    var component = getRouteComp(route);
    return _react.default.createElement(_reactRouterDom.Route, {
      key: route.key || i,
      path: route.path,
      exact: exact,
      strict: route.strict,
      render: function render(props) {
        return renderComp(route, component, props, options);
      }
    });
  })) : null;
  return ret;
}

/***/ }),

/***/ "hoist-non-react-statics":
/*!******************************************!*\
  !*** external "hoist-non-react-statics" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("hoist-non-react-statics");

/***/ }),

/***/ "mini-create-react-context":
/*!********************************************!*\
  !*** external "mini-create-react-context" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mini-create-react-context");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-is":
/*!***************************!*\
  !*** external "react-is" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-is");

/***/ }),

/***/ "regenerator-runtime":
/*!**************************************!*\
  !*** external "regenerator-runtime" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("regenerator-runtime");

/***/ })

/******/ });
//# sourceMappingURL=react-view-router.js.map