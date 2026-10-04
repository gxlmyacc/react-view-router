import React from 'react';
import CSSTransition from '../../transition/src/CSSTransition';
import SwitchTransition, { modes } from '../../transition/src/SwitchTransition';
import { ENTERED, ENTERING, EXITING } from '../../transition/src/Transition';

describe('transition 组件内部行为', () => {
  it('CSSTransition 支持 classNames 对象和函数，并代理全部阶段回调', () => {
    const node = document.createElement('div');
    node.getBoundingClientRect = jest.fn(() => ({ width: 1 } as DOMRect));
    const callbacks = Object.fromEntries(
      ['onEnter', 'onEntering', 'onEntered', 'onExit', 'onExiting', 'onExited'].map((name) => [name, jest.fn()]),
    );
    const transition = new CSSTransition({
      classNames: () => ({
        appear: 'appear-base',
        appearActive: 'appear-active',
        appearDone: 'appear-done',
        enter: 'enter-base',
        enterActive: 'enter-active',
        enterDone: 'enter-done',
        exit: 'exit-base',
        exitActive: 'exit-active',
        exitDone: 'exit-done',
      }),
      ...callbacks,
    } as never);

    transition.onEnter(node, false);
    transition.onEntering(node, false);
    transition.onEntered(node, false);
    expect(node.classList.contains('enter-done')).toBe(true);
    transition.onEnter(node, true);
    transition.onEntering(node, true);
    transition.onEntered(node, true);
    expect(node.classList.contains('appear-done')).toBe(true);
    transition.onExit(node);
    transition.onExiting(node);
    transition.onExited(node);

    expect(node.classList.contains('exit-done')).toBe(true);
    Object.values(callbacks).forEach((callback) => expect(callback).toHaveBeenCalled());
  });

  it('CSSTransition 忽略空节点、缺省 classNames 和缺省 callbacks', () => {
    const transition = new CSSTransition({ classNames: '' } as never);
    transition.onEnter(null, false);
    transition.onEntering(null, false);
    transition.onEntered(null, false);
    transition.onExit(null);
    transition.onExiting(null);
    transition.onExited(null);
    expect(transition.render()).toBeTruthy();
  });

  it('SwitchTransition 根据状态和模式构造转换节点，并调用用户回调', () => {
    const makeChild = (key: string, hook = jest.fn()) => React.createElement('span', {
      key,
      onEntered: hook,
      onExited: hook,
    });
    const oldChild = makeChild('old');
    const newChild = makeChild('new');
    const changeState = jest.fn();
    const instance = new SwitchTransition({ mode: modes.none, children: newChild } as never);
    instance.changeState = changeState;
    instance.state = { current: oldChild, status: EXITING } as never;

    const leaving = instance.render() as React.ReactElement;
    const leavingChild = (leaving.props.children as React.ReactElement);
    leavingChild.props.onExited();
    expect(changeState).toHaveBeenCalledWith(ENTERING, null);
    expect(leavingChild.props.in).toBe(false);

    instance.state = { current: oldChild, status: ENTERING } as never;
    instance.props = { mode: modes.none, children: newChild } as never;
    const entering = instance.render() as React.ReactElement;
    const enteringChild = entering.props.children as React.ReactElement;
    enteringChild.props.onEntered();
    expect(changeState).toHaveBeenCalledWith(ENTERED, expect.anything());
    expect(enteringChild.props.in).toBe(true);

    expect(SwitchTransition.getDerivedStateFromProps({ children: null }, instance.state)).toEqual({ current: null });
    const enteringState = SwitchTransition.getDerivedStateFromProps({ children: newChild, mode: modes.in }, { status: ENTERING, current: oldChild });
    const exitingState = SwitchTransition.getDerivedStateFromProps({ children: newChild, mode: modes.out }, { status: ENTERED, current: oldChild });
    const sameChildState = SwitchTransition.getDerivedStateFromProps({ children: newChild, mode: modes.out }, { status: ENTERED, current: newChild });
    expect(enteringState).toEqual({ status: ENTERING });
    expect(exitingState).toEqual({ status: EXITING });
    expect(sameChildState).toHaveProperty('current');
  });

  it('SwitchTransition in-out 和 together 离场回调落实状态切换', () => {
    const oldChild = React.createElement('span', { key: 'old', onExited: jest.fn() });
    const newChild = React.createElement('span', { key: 'new', onEntered: jest.fn() });
    const instance = new SwitchTransition({ mode: modes.in, children: newChild } as never);
    instance.changeState = jest.fn();
    instance.state = { current: oldChild, status: EXITING } as never;
    const inOut = instance.render() as React.ReactElement;
    const children = inOut.props.children as React.ReactElement[];
    children[1].props.onEntered();
    expect(newChild.props.onEntered).toHaveBeenCalled();

    instance.props = { mode: modes.together, children: newChild } as never;
    const together = instance.render() as React.ReactElement;
    const togetherChildren = together.props.children as React.ReactElement[];
    togetherChildren[1].props.onEntered();
    expect(newChild.props.onEntered).toHaveBeenCalledTimes(2);

    instance.props = { mode: modes.in, children: newChild } as never;
    instance.state = { current: oldChild, status: ENTERING } as never;
    const inOutEntering = instance.render() as React.ReactElement;
    const inOutEnteringChildren = inOutEntering.props.children as React.ReactElement[];
    inOutEnteringChildren[0].props.onExited();
    expect(instance.changeState).toHaveBeenCalledWith(ENTERED, expect.objectContaining({ key: 'new' }));

    instance.props = { mode: modes.out, children: newChild } as never;
    instance.state = { current: oldChild, status: ENTERING } as never;
    const outInEntering = instance.render() as React.ReactElement;
    const outInChild = outInEntering.props.children as React.ReactElement;
    outInChild.props.onEntered();
    expect(instance.changeState).toHaveBeenCalledWith(ENTERED, expect.objectContaining({ key: 'new' }));
  });

  it('SwitchTransition 未知模式回退为 none，并在挂载后更新 context 标记', () => {
    const oldChild = React.createElement('span', { key: 'old' });
    const newChild = React.createElement('span', { key: 'new' });
    const instance = new SwitchTransition({ mode: 'unknown', children: newChild } as never);
    instance.changeState = jest.fn();
    instance.state = { current: oldChild, status: EXITING } as never;
    const leaving = instance.render() as React.ReactElement;
    (leaving.props.children as React.ReactElement).props.onExited();
    expect(instance.changeState).toHaveBeenCalledWith(ENTERING, null);

    instance.state = { current: oldChild, status: ENTERING } as never;
    const entering = instance.render() as React.ReactElement;
    (entering.props.children as React.ReactElement).props.onEntered();
    expect(instance.changeState).toHaveBeenLastCalledWith(ENTERED, expect.objectContaining({ key: 'new' }));
    instance.componentDidMount();
    expect(instance.appeared).toBe(true);
  });
});
