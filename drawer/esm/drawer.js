"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.set-prototype-of");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _rcAnimate = _interopRequireDefault(require("rc-animate"));

var _reactSwipeable = require("react-swipeable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var CAN_USE_DOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

var Drawer =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Drawer, _React$Component);

  function Drawer(props) {
    var _this;

    _classCallCheck(this, Drawer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Drawer).call(this, props));
    _this.isTouching = null;
    _this.getContainer = _this.getContainer.bind(_assertThisInitialized(_this));
    _this.removeContainer = _this.removeContainer.bind(_assertThisInitialized(_this));
    _this.onAnimateAppear = _this.onAnimateAppear.bind(_assertThisInitialized(_this));
    _this.onAnimateLeave = _this.onAnimateLeave.bind(_assertThisInitialized(_this));
    _this.onTouchMove = _this.onTouchMove.bind(_assertThisInitialized(_this));
    _this.onTouchEnd = _this.onTouchEnd.bind(_assertThisInitialized(_this));
    _this.close = _this.close.bind(_assertThisInitialized(_this));
    _this.onMaskClick = _this.onMaskClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Drawer, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.restoreOverflow();
      this.removeContainer();
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(event) {
      if (!this.drawerRef) return;

      if (this.isTouching === null) {
        this.isTouching = event.dir === 'Right';
        if (!this.isTouching) return;
      }

      if (this.isTouching === false) return;
      var drawerRef = this.drawerRef;
      var deltaX = Math.max(-event.deltaX, 0);
      drawerRef.style.webkitTransform = drawerRef.style.transform = "translateX(".concat(deltaX, "px)");
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(event) {
      var _this2 = this;

      if (this.isTouching && -event.deltaX > this.props.touchThreshold) {
        var drawerRef = this.drawerRef;
        var viewLength = drawerRef.getBoundingClientRect().width;
        drawerRef.classList.add('touched');
        var fn = null;
        var actionClass = '';

        if (-event.deltaX > viewLength / 2) {
          actionClass = 'touch-hide';

          fn = function fn() {
            return _this2.close();
          };
        } else actionClass = 'touch-restore';

        drawerRef.style.webkitTransform = drawerRef.style.transform = '';
        if (actionClass) drawerRef.classList.add(actionClass);
        setTimeout(function () {
          fn && fn();
          drawerRef.classList.remove(actionClass);
          drawerRef.classList.remove('touched');
        }, this.props.delay);
      }

      this.isTouching = null;
    }
  }, {
    key: "removeContainer",
    value: function removeContainer() {
      if (!this.container) return;
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      if (!this.container) {
        var container = document.createElement('div');
        var containerId = "".concat(this.props.prefixCls, "-container-").concat(new Date().getTime());
        container.setAttribute('id', containerId);
        document.body.appendChild(container);
        this.container = container;
      }

      return this.container;
    }
  }, {
    key: "getZIndexStyle",
    value: function getZIndexStyle() {
      var style = {};
      if (this.props.zIndex !== undefined) style.zIndex = this.props.zIndex;
      return style;
    }
  }, {
    key: "getWrapStyle",
    value: function getWrapStyle() {
      var wrapStyle = this.props.wrapStyle || {};
      return _objectSpread({}, this.getZIndexStyle(), {}, wrapStyle);
    }
  }, {
    key: "getMaskStyle",
    value: function getMaskStyle() {
      var maskStyle = this.props.maskStyle || {};
      return _objectSpread({}, this.getZIndexStyle(), {}, maskStyle);
    }
  }, {
    key: "getMaskTransitionName",
    value: function getMaskTransitionName() {
      var props = this.props;
      var transitionName = props.maskTransitionName;
      var animation = props.maskAnimation;

      if (!transitionName && animation) {
        transitionName = "".concat(props.prefixCls, "-").concat(animation);
      }

      return transitionName;
    }
  }, {
    key: "getTransitionName",
    value: function getTransitionName() {
      var props = this.props;
      var transitionName = props.transitionName;
      var animation = props.animation;

      if (!transitionName && animation) {
        transitionName = "".concat(props.prefixCls, "-").concat(animation);
      }

      return transitionName;
    }
  }, {
    key: "getDrawerElement",
    value: function getDrawerElement() {
      var _this3 = this;

      var props = this.props;
      var prefixCls = props.prefixCls;
      var transitionName = this.getTransitionName();

      var dialogElement = _react.default.createElement('div', {
        key: 'drawer-element',
        role: 'document',
        ref: function ref(el) {
          return _this3.drawerRef = el;
        },
        style: props.style || {},
        className: "".concat(prefixCls, " ").concat(props.className || ''),
        open: props.open
      }, props.children);

      dialogElement = _react.default.createElement(_rcAnimate.default, {
        key: 'drawer',
        showProp: 'open',
        onAppear: this.onAnimateAppear,
        onLeave: this.onAnimateLeave,
        transitionName: transitionName,
        component: '',
        transitionAppear: true
      }, dialogElement);

      if (this.props.touch) {
        dialogElement = _react.default.createElement(_reactSwipeable.Swipeable, {
          className: "".concat(props.prefixCls, "-wrap"),
          onSwiping: this.onTouchMove,
          onSwiped: this.onTouchEnd
        }, dialogElement);
      }

      return dialogElement;
    }
  }, {
    key: "restoreOverflow",
    value: function restoreOverflow() {
      if (document.body.style.overflow) document.body.style.overflow = '';
    }
  }, {
    key: "onAnimateAppear",
    value: function onAnimateAppear() {
      document.body.style.overflow = 'hidden';
      if (this.props.onAnimateStart) this.props.onAnimateStart();
    }
  }, {
    key: "onAnimateLeave",
    value: function onAnimateLeave() {
      this.restoreOverflow();
      if (this.props.onAnimateLeave) this.props.onAnimateLeave();
      if (this.props.afterClose) this.props.afterClose();
    }
  }, {
    key: "close",
    value: function close(e) {
      if (this.props.onClose) this.props.onClose(e);
    }
  }, {
    key: "onMaskClick",
    value: function onMaskClick(e) {
      if (!this.props.maskClosable) return;
      if (e.target === e.currentTarget) this.close(e);
    }
  }, {
    key: "render",
    value: function render() {
      if (!CAN_USE_DOM) return null;
      var props = this.props;
      var drawer = this.getDrawerElement();

      if (props.mask) {
        drawer = _react.default.createElement('div', _objectSpread({
          style: this.getMaskStyle(),
          key: 'mask-element',
          className: "".concat(props.prefixCls, "-mask ").concat(props.open ? "".concat(props.prefixCls, "-mask-hidden") : ''),
          open: props.open
        }, props.maskProps, {
          onClick: this.onMaskClick
        }), drawer);
        var transitionName = this.getMaskTransitionName();

        if (transitionName) {
          drawer = _react.default.createElement(_rcAnimate.default, {
            key: 'mask',
            showProp: 'open',
            transitionAppear: true,
            component: '',
            transitionName: transitionName
          }, drawer);
        }
      }

      return _reactDom.default.createPortal(drawer, this.getContainer());
    }
  }]);

  return Drawer;
}(_react.default.Component);

Drawer.defaultProps = {
  prefixCls: 'rvr-drawer',
  className: '',
  mask: true,
  open: false,
  maskClosable: false,
  touch: true,
  touchThreshold: 10,
  delay: 400
};
var _default = Drawer;
exports.default = _default;