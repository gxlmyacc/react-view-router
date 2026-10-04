import React from 'react';
import ReactDOM from 'react-dom';
import { CAN_USE_DOM } from '../..';
import type { RouterDrawerOptions } from './context';

type DrawerProps = {
  touchThreshold?: number,
  position?: RouterDrawerOptions['position'],
  portalContainer?: () => HTMLElement | null,
} & { [key: string]: any };

type DrawerState = { visible: boolean, phase: 'enter' | 'enter-active' | 'leave' | 'leave-active' | '' };


// A body lock belongs to all visible masked portals, regardless of nesting order.
const bodyLocks = new Set<object>();
let bodyOverflow = '';

class Drawer extends React.Component<DrawerProps, DrawerState> {

  closed: boolean;

  isTouching: boolean | null;

  drawerRef: HTMLElement | null;

  private portalTarget: HTMLElement | null = null;

  private holdsBodyLock = false;

  private touchTimer: ReturnType<typeof setTimeout> | null = null;

  touchStart: { x: number, y: number } | null;

  animationTimer: ReturnType<typeof setTimeout> | null;

  activationTimer: ReturnType<typeof setTimeout> | null;

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
    this.drawerRef = null;
    this.touchStart = null;
    this.animationTimer = null;
    this.activationTimer = null;
    this.state = { visible: Boolean(props.open), phase: props.open ? 'enter' : '' };
    this.getContainer = this.getContainer.bind(this);
    this.onAnimateAppear = this.onAnimateAppear.bind(this);
    this.onAnimateLeave = this.onAnimateLeave.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.close = this.close.bind(this);
    this.onMaskClick = this.onMaskClick.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onNativeTouchMove = this.onNativeTouchMove.bind(this);
    this.onNativeTouchEnd = this.onNativeTouchEnd.bind(this);
    this.onPanelAnimationEnd = this.onPanelAnimationEnd.bind(this);
  }

  componentDidMount() {
    if (!this.props.open) return;
    this.onAnimateAppear();
    if (this.getTransitionName() || this.getMaskTransitionName()) {
      this.activationTimer = setTimeout(() => this.setState({ phase: 'enter-active' }), 20);
      this.animationTimer = setTimeout(() => this.setState({ phase: '' }), this.props.delay);
    }
  }

  componentDidUpdate(previousProps: DrawerProps) {
    this.syncOverflow();
    if (previousProps.position !== this.props.position || previousProps.touch !== this.props.touch) this.resetTouch();
    if (previousProps.open === this.props.open) return;
    if (this.animationTimer) clearTimeout(this.animationTimer);
    if (this.activationTimer) clearTimeout(this.activationTimer);
    this.resetTouch();
    if (this.props.open) {
      this.closed = false;
      this.setState({ visible: true, phase: 'enter' }, () => {
        this.onAnimateAppear();
        this.activationTimer = setTimeout(() => this.setState({ phase: 'enter-active' }), 20);
        this.animationTimer = setTimeout(() => this.setState({ phase: '' }), this.props.delay);
      });
    } else if (this.getTransitionName() || this.getMaskTransitionName()) {
      this.setState({ phase: 'leave' }, () => {
        this.activationTimer = setTimeout(() => this.setState({ phase: 'leave-active' }), 20);
        this.animationTimer = setTimeout(() => {
          this.setState({ visible: false, phase: '' });
          this.onAnimateLeave();
        }, this.props.delay);
      });
    } else {
      this.setState({ visible: false, phase: '' });
      this.onAnimateLeave();
    }
  }

  componentWillUnmount() {
    if (this.animationTimer) clearTimeout(this.animationTimer);
    if (this.activationTimer) clearTimeout(this.activationTimer);
    this.resetTouch();
    this.restoreOverflow();
  }

  onTouchStart(event: React.TouchEvent) {
    event.stopPropagation?.();
    this.resetTouch();
    if (!this.props.touch || this.props.position === 'center') return;
    const touch = event.touches[0];
    if (touch) this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  private getTouchMovement(touch: { clientX: number; clientY: number }) {
    const dx = touch.clientX - this.touchStart!.x;
    const dy = touch.clientY - this.touchStart!.y;
    const vertical = this.props.position === 'top' || this.props.position === 'bottom';
    if (vertical ? Math.abs(dy) <= Math.abs(dx) : Math.abs(dx) <= Math.abs(dy)) return null;
    return { dir: vertical ? (dy > 0 ? 'Down' : 'Up') : (dx > 0 ? 'Right' : 'Left'), deltaX: -(vertical ? dy : dx) };
  }

  onNativeTouchMove(event: React.TouchEvent) {
    event.stopPropagation?.();
    if (!this.touchStart || !this.props.touch || this.props.position === 'center') return;
    const touch = event.touches[0];
    const movement = touch && this.getTouchMovement(touch);
    if (movement) this.onTouchMove(movement);
  }

  onNativeTouchEnd(event: React.TouchEvent) {
    event.stopPropagation?.();
    if (!this.touchStart || !this.props.touch || this.props.position === 'center') return;
    const touch = event.changedTouches[0];
    const movement = touch && this.getTouchMovement(touch);
    if (movement) this.onTouchEnd(movement);
    else this.finishTouch(false);
    this.touchStart = null;
  }

  onPanelAnimationEnd(event: React.AnimationEvent) {
    if (event.target !== event.currentTarget) return;
    if (this.animationTimer) clearTimeout(this.animationTimer);
    if (this.state.phase === 'leave-active') {
      this.setState({ visible: false, phase: '' });
      this.onAnimateLeave();
    } else if (this.state.phase === 'enter-active') {
      this.setState({ phase: '' });
    }
  }

  onTouchMove(event: { dir: string, deltaX: number }) {
    if (!this.drawerRef || !this.props.touch || this.props.position === 'center' || this.touchTimer) return;
    if (this.isTouching === null) {
      const direction = { right: 'Right', left: 'Left', bottom: 'Down', top: 'Up', center: '' }[this.props.position || 'right'];
      this.isTouching = event.dir === direction;
      if (!this.isTouching) return;
    }
    if (this.isTouching === false) return;

    const drawerRef = this.drawerRef;
    const negative = this.props.position === 'left' || this.props.position === 'top';
    const distance = Math.max((negative ? 1 : -1) * event.deltaX, 0) * (negative ? -1 : 1);
    const axis = this.props.position === 'top' || this.props.position === 'bottom' ? 'Y' : 'X';
    drawerRef.style.webkitTransform = drawerRef.style.transform = `translate${axis}(${distance}px)`;
  }

  onTouchEnd(event: { dir: string, deltaX: number }) {
    const panel = this.drawerRef;
    const distance = (this.props.position === 'left' || this.props.position === 'top' ? 1 : -1) * event.deltaX;
    const bounds = panel?.getBoundingClientRect();
    const length = this.props.position === 'top' || this.props.position === 'bottom' ? bounds?.height : bounds?.width;
    this.finishTouch(Boolean(this.props.touch && this.props.position !== 'center' && this.isTouching
      && distance > (this.props.touchThreshold || 10) && distance > (length || 0) / 2));
  }

  private resetTouch() {
    if (this.touchTimer) clearTimeout(this.touchTimer);
    this.touchTimer = null;
    this.touchStart = null;
    this.isTouching = null;
    const panel = this.drawerRef;
    if (!panel) return;
    panel.style.webkitTransform = panel.style.transform = '';
    panel.style.transitionDuration = '';
    panel.classList.remove('touched', 'touch-hide', 'touch-restore');
  }

  private finishTouch(shouldClose: boolean) {
    const panel = this.drawerRef;
    if (!panel || !this.isTouching) {
      this.resetTouch();
      return;
    }
    panel.style.transitionDuration = `${this.props.delay}ms`;
    panel.classList.add('touched');
    // Commit the dragged position before transitioning to the rest/hidden position.
    panel.getBoundingClientRect();
    panel.style.webkitTransform = panel.style.transform = '';
    panel.classList.add(shouldClose ? 'touch-hide' : 'touch-restore');
    this.touchStart = null;
    this.isTouching = null;
    this.touchTimer = setTimeout(() => {
      this.resetTouch();
      if (shouldClose) {
        this.closed = true;
        this.close();
      }
    }, this.props.delay);
  }

  onTouchCancel = (event: React.TouchEvent) => {
    event.stopPropagation();
    this.finishTouch(false);
  };

  getContainer(): HTMLElement | null {
    return this.props.portalContainer?.() || null;
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

  private getAlignmentStyle(): React.CSSProperties {
    const position = this.props.position || 'right';
    return {
      alignItems: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center',
      justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
    };
  }

  getMaskStyle() {
    const maskStyle = this.props.maskStyle || {};
    return { ...this.getAlignmentStyle(), ...this.getZIndexStyle(), ...maskStyle };
  }

  getMaskTransitionName() {
    if (this.closed || !this.props.mask) return '';
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

    const transitionName = this.getTransitionName();
    const phase = this.state.phase;
    const phaseName = phase.indexOf('enter') === 0 ? 'enter' : 'leave';
    const phaseClass = transitionName && phase
      ? `${transitionName}-${phaseName}${phase.endsWith('-active') ? ` ${transitionName}-${phaseName}-active` : ''}`
      : '';
    const dialogElement = React.createElement('div', {
      key: 'drawer-element',
      role: 'document',
      ref: (el: HTMLElement) => this.drawerRef = el,
      style: props.style || {},
      className: `${prefixCls} ${prefixCls}-${props.position || 'right'} ${props.className || ''} ${phaseClass}`,
      open: props.open,
      onAnimationEnd: this.onPanelAnimationEnd,
      // Portals still bubble through the React tree. Own events at the nearest panel.
      onTouchStart: (event: React.TouchEvent) => { this.onTouchStart(event); },
      onTouchMove: (event: React.TouchEvent) => { this.onNativeTouchMove(event); },
      onTouchEnd: (event: React.TouchEvent) => { this.onNativeTouchEnd(event); },
      onTouchCancel: this.onTouchCancel,
      onClick: (event: React.MouseEvent) => event.stopPropagation(),
    }, props.children);

    if (this.props.touch) {
      return React.createElement('div', {
        className: `${props.prefixCls}-wrap`,
        style: this.getAlignmentStyle(),
        onTouchStart: this.onTouchStart,
        onTouchMove: this.onNativeTouchMove,
        onTouchEnd: this.onNativeTouchEnd,
        onTouchCancel: this.onTouchCancel,
      }, dialogElement);
    }

    return dialogElement;
  }

  restoreOverflow() {
    if (!this.holdsBodyLock) return;
    bodyLocks.delete(this);
    this.holdsBodyLock = false;
    if (!bodyLocks.size) document.body.style.overflow = bodyOverflow;
  }

  onAnimateAppear() {
    this.syncOverflow();
    if (this.props.onAnimateStart) this.props.onAnimateStart();
  }

  private syncOverflow() {
    if (!this.props.mask || !this.state.visible || this.portalTarget !== document.body) {
      this.restoreOverflow();
    } else if (!this.holdsBodyLock) {
      if (!bodyLocks.size) bodyOverflow = document.body.style.overflow;
      bodyLocks.add(this);
      this.holdsBodyLock = true;
      document.body.style.overflow = 'hidden';
    }
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
    e.stopPropagation();
    if (!this.props.maskClosable) return;
    // The touch wrapper fills the backdrop; its empty area is also outside the panel.
    if (e.target === e.currentTarget
      || (this.props.touch && this.drawerRef && e.target === this.drawerRef.parentElement)) this.close(e);
  }

  render() {
    if (!CAN_USE_DOM) return null;

    const props = this.props;

    if (props.open) this.closed = false;

    if (!this.state.visible) return null;

    const portalTarget = this.getContainer();
    this.portalTarget = portalTarget;
    let drawer: React.ReactElement = this.getDrawerElement();
    if (props.mask) {
      const maskTransitionName = this.getMaskTransitionName();
      const phase = this.state.phase;
      const phaseName = phase.indexOf('enter') === 0 ? 'enter' : 'leave';
      const maskPhaseClass = maskTransitionName && phase
        ? `${maskTransitionName}-${phaseName}${
          phase.endsWith('-active')
            ? ` ${maskTransitionName}-${phaseName}-active`
            : ''
        }`
        : '';
      drawer = React.createElement('div', {
        style: this.getMaskStyle(),
        key: 'mask-element',
        onTouchStart: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchMove: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchEnd: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchCancel: (event: React.TouchEvent) => event.stopPropagation(),
        className: `${props.prefixCls}-mask ${
          portalTarget !== document.body ? `${props.prefixCls}-mask-inline` : ''
        } ${props.open ? `${props.prefixCls}-mask-hidden` : ''} ${maskPhaseClass}`,
        open: props.open,
        ...props.maskProps,
        onClick: this.onMaskClick
      }, drawer);
    } else {
      // Keep the positioning frame without a backdrop or an input-blocking layer.
      drawer = React.createElement('div', {
        key: 'mask-element',
        onTouchStart: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchMove: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchEnd: (event: React.TouchEvent) => event.stopPropagation(),
        onTouchCancel: (event: React.TouchEvent) => event.stopPropagation(),
        style: this.getMaskStyle(),
        className: `${props.prefixCls}-container ${
          portalTarget !== document.body ? `${props.prefixCls}-container-inline` : ''
        }`,
      }, drawer);
    }
    return portalTarget
      ? ReactDOM.createPortal(drawer, portalTarget)
      : drawer;
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
  delay: 200,
};

export default Drawer;
