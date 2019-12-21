"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRouterLink;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es6.regexp.replace");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function guardEvent(e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return; // don't redirect when preventDefault called

  if (e.defaultPrevented) return; // don't redirect on right click

  if (e.button !== undefined && e.button !== 0) return; // don't redirect if `target="_blank"`

  if (e.currentTarget && e.currentTarget.getAttribute) {
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return;
  } // this may be a Weex event which doesn't have this method


  if (e.preventDefault) {
    e.preventDefault();
  }

  return true;
}

function createRouterLink(router) {
  var RouterLink =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(RouterLink, _React$Component);

    function RouterLink(props) {
      var _this;

      _classCallCheck(this, RouterLink);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RouterLink).call(this, props));

      _defineProperty(_assertThisInitialized(_this), "unplugin", void 0);

      _this.state = {
        inited: false,
        currentRoute: router.currentRoute,
        parentRoute: null
      };
      return _this;
    }

    _createClass(RouterLink, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this.unplugin = router.plugin({
          name: 'router-link-plugin',
          onRouteChange: function onRouteChange(currentRoute) {
            _this2.setState({
              currentRoute: currentRoute
            });

            if (_this2.props.onRouteChange) _this2.props.onRouteChange(currentRoute);
          }
        });
        var routerView = (0, _util.getHostRouterView)(this);
        this.setState({
          inited: true,
          parentRoute: routerView ? routerView.state.currentRoute : null
        });
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (this.unplugin) {
          this.unplugin();
          this.unplugin = undefined;
        }
      }
    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
        if (this.props.to !== nextProps.to) return true;
        if (this.props.replace !== nextProps.replace) return true;
        if (this.props.tag !== nextProps.tag) return true;
        if (this.props.activeClass !== nextProps.activeClass) return true;
        if (this.props.exact !== nextProps.exact) return true;
        if (this.props.exactActiveClass !== nextProps.exactActiveClass) return true;
        if (this.props.event !== nextProps.event) return true;
        if (this.state.inited !== nextState.inited) return true;
        if ((0, _util.isRouteChanged)(this.state.parentRoute, nextState.parentRoute)) return true;
        if ((0, _util.isRouteChanged)(this.state.currentRoute, nextState.currentRoute)) return true;
        return false;
      }
    }, {
      key: "render",
      value: function render() {
        if (!this.state.inited) return null;

        var _this$props = this.props,
            tag = _this$props.tag,
            to = _this$props.to,
            exact = _this$props.exact,
            replace = _this$props.replace,
            append = _this$props.append,
            event = _this$props.event,
            _this$props$children = _this$props.children,
            children = _this$props$children === void 0 ? [] : _this$props$children,
            activeClass = _this$props.activeClass,
            exactActiveClass = _this$props.exactActiveClass,
            remainProps = _objectWithoutProperties(_this$props, ["tag", "to", "exact", "replace", "append", "event", "children", "activeClass", "exactActiveClass"]);

        var current = this.state.currentRoute;
        to = (0, _util.normalizeLocation)(to, this.state.parentRoute, append);
        if (router.linkActiveClass) activeClass = router.linkActiveClass;
        if (router.linkExactActiveClass) exactActiveClass = router.linkExactActiveClass;
        var fallbackClass = exact ? to.path === current.path ? exactActiveClass : '' : current.path.startsWith(to.path) ? activeClass : '';

        if (fallbackClass) {
          if (remainProps.className) remainProps.className = "".concat(fallbackClass, " ").concat(remainProps.className);else remainProps.className = fallbackClass;
        }

        if (!Array.isArray(event)) event = [event];
        var events = {};
        event.forEach(function (evt) {
          events[(0, _util.camelize)("on-".concat(evt))] = function (e) {
            guardEvent(e);
            if (replace) router.replace(to);else router.push(to);
          };
        });
        if (tag === 'a') remainProps.href = to.path;
        return _react.default.createElement.apply(_react.default, [tag, Object.assign(remainProps, events)].concat(_toConsumableArray(children)));
      }
    }]);

    return RouterLink;
  }(_react.default.Component);

  _defineProperty(RouterLink, "propTypes", void 0);

  _defineProperty(RouterLink, "defaultProps", void 0);

  RouterLink.propTypes = {
    to: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.object]).isRequired,
    replace: _propTypes.default.bool,
    append: _propTypes.default.bool,
    tag: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.elementType]),
    activeClass: _propTypes.default.string,
    exact: _propTypes.default.bool,
    exactActiveClass: _propTypes.default.string,
    event: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.arrayOf(_propTypes.default.string)]),
    onRouteChange: _propTypes.default.func
  };
  RouterLink.defaultProps = {
    tag: 'a',
    activeClass: 'router-link-active',
    exactActiveClass: 'exact-active-class',
    event: 'click'
  };
  return RouterLink;
}
//# sourceMappingURL=router-link.js.map