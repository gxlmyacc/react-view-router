import React from 'react';
import type { TransitionPresenterProps } from './types';

/**
 * @typedef {object} TransitionPresenterProps
 * @property {React.ReactNode} children
 * @property {{ path: string } | null} route
 * @property {{ mode: string, props: object }} transitionMap
 * @property {React.ElementType} containerTag
 * @property {React.CSSProperties} containerStyle
 */

/**
 * Keep scroll offsets visible in a cloned page during its exit animation.
 * @param {HTMLElement} source
 * @param {HTMLElement} copy
 */
function copyScrollState(source: HTMLElement, copy: HTMLElement) {
  copy.scrollLeft = source.scrollLeft;
  copy.scrollTop = source.scrollTop;
  for (let index = 0; index < source.children.length; index += 1) {
    copyScrollState(source.children[index] as HTMLElement, copy.children[index] as HTMLElement);
  }
}

/**
 * Animate a visual snapshot instead of mounting a second copy of the route.
 * This leaves a single live KeepAlive tree in the stable current container.
 * @extends {React.Component<TransitionPresenterProps>}
 */
export default class TransitionViewPresenter extends React.Component<TransitionPresenterProps> {

  stage: HTMLElement | null = null;

  currentNode: HTMLElement | null = null;

  snapshotNode: HTMLElement | null = null;

  animationTimer: ReturnType<typeof setTimeout> | null = null;

  private setContainerRef = (node: HTMLElement | null) => {
    this.props.setContainerRef?.(node);
  };

  getSnapshotBeforeUpdate(previousProps: TransitionPresenterProps): HTMLElement | null {
    if (previousProps.route?.path === this.props.route?.path || !this.currentNode) return null;
    const { onExit } = this.props.transitionMap.props;
    if (onExit) onExit(this.currentNode);
    const snapshot = this.currentNode.cloneNode(true) as HTMLElement;
    copyScrollState(this.currentNode, snapshot);
    return snapshot;
  }

  componentDidUpdate(_previousProps: TransitionPresenterProps, _previousState: unknown, snapshot: HTMLElement | null): void {
    if (!snapshot || !this.stage || !this.currentNode) return;
    this.finishAnimation();

    const { transitionMap } = this.props;
    const transitionProps = transitionMap.props;
    const classNames = typeof transitionProps.classNames === 'function'
      ? transitionProps.classNames()
      : transitionProps.classNames;
    if (!classNames) return;

    const outgoing = snapshot;
    // A rapid navigation may clone the previous entrance before it finishes.
    Array.from(outgoing.classList).forEach((name) => {
      if (name.endsWith('-enter') || name.endsWith('-enter-active')) outgoing.classList.remove(name);
    });
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.style.pointerEvents = 'none';
    outgoing.style.position = 'absolute';
    outgoing.style.top = '0';
    outgoing.style.left = '0';
    outgoing.style.width = '100%';
    this.stage.insertBefore(outgoing, this.currentNode);
    this.snapshotNode = outgoing;

    outgoing.classList.add(`${classNames}-exit`);
    this.currentNode.classList.add(`${classNames}-enter`);
    if (transitionProps.onExitSnapshot) transitionProps.onExitSnapshot(outgoing);
    if (transitionProps.onEnter) transitionProps.onEnter(this.currentNode);
    // Commit the entering node's initial transform/opacity before activating it.
    this.currentNode.getBoundingClientRect();
    const duration = transitionProps.timeout || 0;
    const timings = transitionProps.getTimings?.(classNames) || {};
    const enterDelay = timings.enterDelay || 0;
    outgoing.style.transitionDuration = `${timings.exitDuration ?? duration}ms`;
    outgoing.style.webkitTransitionDuration = outgoing.style.transitionDuration;
    outgoing.style.transitionDelay = '0ms';
    outgoing.style.webkitTransitionDelay = '0ms';
    this.currentNode.style.transitionDuration = `${duration - enterDelay}ms`;
    this.currentNode.style.webkitTransitionDuration = this.currentNode.style.transitionDuration;
    this.currentNode.style.transitionDelay = `${enterDelay}ms`;
    this.currentNode.style.webkitTransitionDelay = this.currentNode.style.transitionDelay;
    outgoing.classList.add(`${classNames}-exit-active`);
    this.currentNode.classList.add(`${classNames}-enter-active`);
    if (transitionProps.onEntering) transitionProps.onEntering(this.currentNode);

    const finish = () => {
      if (this.snapshotNode === outgoing) this.finishAnimation();
    };
    if (transitionProps.addEndListener) {
      const coverExit = !classNames.includes('fade-slide') && /slide-(?:right|(?:up|down)-back)/.test(classNames);
      const target = coverExit ? outgoing : this.currentNode;
      transitionProps.addEndListener(target, finish);
    }
    this.animationTimer = setTimeout(finish, (transitionProps.timeout || 0) + 50);
  }

  componentWillUnmount() {
    this.finishAnimation();
  }

  finishAnimation() {
    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.animationTimer = null;
    const { transitionMap } = this.props;
    const transitionProps = transitionMap.props;
    const outgoing = this.snapshotNode;
    if (!outgoing) return;
    if (transitionProps.onExited) transitionProps.onExited(outgoing);
    if (transitionProps.onEntered && this.currentNode) transitionProps.onEntered(this.currentNode);
    if (this.currentNode) {
      Array.prototype.forEach.call(Array.from(this.currentNode.classList), (name: string) => {
        if (name.endsWith('-enter') || name.endsWith('-enter-active')) this.currentNode?.classList.remove(name);
      });
      this.currentNode.style.transitionDuration = '';
      this.currentNode.style.webkitTransitionDuration = '';
      this.currentNode.style.transitionDelay = '';
      this.currentNode.style.webkitTransitionDelay = '';
    }
    if (outgoing.parentNode) outgoing.parentNode.removeChild(outgoing);
    this.snapshotNode = null;
  }

  render() {
    const { children, containerTag, containerStyle } = this.props;
    return React.createElement('div', {
      ref: (node: HTMLElement | null) => { this.stage = node; },
      style: { position: 'relative', height: '100%', overflow: 'hidden' },
    }, React.createElement('div', {
      ref: (node: HTMLElement | null): void => { this.currentNode = node; },
      style: { height: '100%' },
    }, React.createElement(containerTag, {
      style: containerStyle,
      ref: this.setContainerRef,
    }, children)));
  }

}
