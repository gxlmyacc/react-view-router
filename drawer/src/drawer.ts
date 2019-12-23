import React from 'react';
import ReactDOM from 'react-dom';
import Animate from 'rc-animate';
import { Swipeable } from 'react-swipeable';

const CAN_USE_DOM = !!(
  typeof window !== 'undefined'
  && window.document
  && window.document.createElement
);

type DrawerProps = {
  touchThreshold: number
} & { [key: string]: any };

type DrawerState = {

};


class Drawer extends React.Component<DrawerProps, DrawerState> {

  closed: boolean;

  isTouching: boolean | null;

  drawerRef: HTMLElement | null;

  container: HTMLElement | null;

  static defaultProps: {
    prefixCls: string,
    className: string,
    mask: boolean,
    open: boolean,
    maskClosable: boolean,
    touch: boolean,
    touchThreshold: number,
    delay: number,
  };

  constructor(props: DrawerProps) {
    super(props);
    this.closed = false;
    this.isTouching = null;
    this.container = null;
    this.drawerRef = null;
    this.getContainer = this.getContainer.bind(this);
    this.removeContainer = this.removeContainer.bind(this);
    this.onAnimateAppear = this.onAnimateAppear.bind(this);
    this.onAnimateLeave = this.onAnimateLeave.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.close = this.close.bind(this);
    this.onMaskClick = this.onMaskClick.bind(this);
  }

  componentWillUnmount() {
    this.restoreOverflow();
    this.removeContainer();
  }

  onTouchMove(event: { dir: string, deltaX: number }) {
    if (!this.drawerRef) return;
    if (this.isTouching === null) {
      this.isTouching = event.dir === 'Right';
      if (!this.isTouching) return;
    }
    if (this.isTouching === false) return;

    const drawerRef = this.drawerRef;
    let deltaX = Math.max(-event.deltaX, 0);
    drawerRef.style.webkitTransform = drawerRef.style.transform = `translateX(${deltaX}px)`;
  }

  onTouchEnd(event: { dir: string, deltaX: number }) {
    if (this.isTouching && -event.deltaX > this.props.touchThreshold) {
      const drawerRef = this.drawerRef;
      if (!drawerRef) return;
      const viewLength = drawerRef.getBoundingClientRect().width;
      drawerRef.classList.add('touched');
      let close: Function | null = null;
      let actionClass = '';
      if (-event.deltaX > (viewLength / 2)) {
        actionClass = 'touch-hide';
        close = () => {
          this.closed = true;
          this.close();
        };
      } else actionClass = 'touch-restore';
      drawerRef.style.webkitTransform = drawerRef.style.transform = '';
      if (actionClass) drawerRef.classList.add(actionClass);
      setTimeout(() => {
        close && close();
        drawerRef.classList.remove(actionClass);
        drawerRef.classList.remove('touched');
      }, this.props.delay);
    }
    this.isTouching = null;
  }

  removeContainer() {
    if (!this.container) return;
    if (this.container.parentNode) this.container.parentNode.removeChild(this.container);
    this.container = null;
  }

  getContainer() {
    if (!this.container) {
      const container = document.createElement('div');
      const containerId = `${this.props.prefixCls}-container-${(new Date().getTime())}`;
      container.setAttribute('id', containerId);
      document.body.appendChild(container);
      this.container = container;
    }
    return this.container;
  }

  getZIndexStyle() {
    const style: { zIndex?: number } = {};
    if (this.props.zIndex !== undefined) style.zIndex = this.props.zIndex;
    return style;
  }

  getWrapStyle() {
    const wrapStyle = this.props.wrapStyle || {};
    return { ...this.getZIndexStyle(), ...wrapStyle };
  }

  getMaskStyle() {
    const maskStyle = this.props.maskStyle || {};
    return { ...this.getZIndexStyle(), ...maskStyle };
  }

  getMaskTransitionName() {
    if (this.closed) return '';
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    if (this.closed) return '';
    const props = this.props;
    let transitionName = props.transitionName;
    const animation = props.animation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getDrawerElement() {
    const props = this.props;
    const prefixCls = props.prefixCls;

    let dialogElement = React.createElement('div', {
      key: 'drawer-element',
      role: 'document',
      ref: (el: HTMLElement) => this.drawerRef = el,
      style: props.style || {},
      className: `${prefixCls} ${props.className || ''}`,
      open: props.open,
    }, props.children);

    const transitionName = this.getTransitionName();
    if (transitionName) {
      dialogElement = React.createElement(Animate, {
        key: 'drawer',
        showProp: 'open',
        onAppear: this.onAnimateAppear,
        onLeave: this.onAnimateLeave,
        transitionName,
        component: '',
        transitionAppear: true,
      }, dialogElement) as any;
    }

    if (this.props.touch) {
      dialogElement = React.createElement(Swipeable, {
        className: `${props.prefixCls}-wrap`,
        onSwiping: this.onTouchMove,
        onSwiped: this.onTouchEnd,
      }, dialogElement) as any;
    }

    return dialogElement;
  }

  restoreOverflow() {
    if (document.body.style.overflow) document.body.style.overflow = '';
  }

  onAnimateAppear() {
    document.body.style.overflow = 'hidden';
    if (this.props.onAnimateStart) this.props.onAnimateStart();
  }

  onAnimateLeave() {
    this.restoreOverflow();
    if (this.props.onAnimateLeave) this.props.onAnimateLeave();
    if (this.props.afterClose) this.props.afterClose();
  }

  close(e?: any) {
    if (this.props.onClose) this.props.onClose(e);
  }

  onMaskClick(e: React.SyntheticEvent) {
    if (!this.props.maskClosable) return;
    if (e.target === e.currentTarget) this.close(e);
  }

  render() {
    if (!CAN_USE_DOM) return null;

    const props = this.props;

    if (props.open) this.closed = false;

    let drawer = this.getDrawerElement();
    if (props.mask) {
      drawer = React.createElement('div', {
        style: this.getMaskStyle(),
        key: 'mask-element',
        className: `${props.prefixCls}-mask ${props.open ? `${props.prefixCls}-mask-hidden` : ''}`,
        open: props.open,
        ...props.maskProps,
        onClick: this.onMaskClick
      }, drawer);

      const transitionName = this.getMaskTransitionName();
      if (transitionName) {
        drawer = React.createElement(Animate, {
          key: 'mask',
          showProp: 'open',
          transitionAppear: true,
          component: '',
          transitionName,
        }, drawer) as any;
      }
    }
    return ReactDOM.createPortal(drawer, this.getContainer());
  }

}

Drawer.defaultProps = {
  prefixCls: 'rvr-drawer',
  className: '',
  mask: true,
  open: false,
  maskClosable: false,
  touch: true,
  touchThreshold: 10,
  delay: 400,
};

export default Drawer;
