import React from 'react';
import PropTypes from 'prop-types';
import { act, render, screen } from '@testing-library/react';
import config from 'react-transition-group/esm/config';
import TransitionGroupContext from 'react-transition-group/TransitionGroupContext';
import Transition from '../../transition/src/Transition';

describe('Transition 基础状态机', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('appear 时使用 appear timeout 并执行完整回调', () => {
    jest.useFakeTimers();
    const onEnter = jest.fn();
    const onEntering = jest.fn();
    const onEntered = jest.fn();
    render(
      <Transition in appear timeout={{ appear: 20, enter: 10, exit: 5 }} onEnter={onEnter} onEntering={onEntering} onEntered={onEntered}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    expect(onEnter).toHaveBeenCalledWith(expect.any(HTMLElement), true);
    expect(screen.getByTestId('state').textContent).toBe('entering');
    act(() => jest.advanceTimersByTime(20));
    expect(onEntering).toHaveBeenCalledWith(expect.any(HTMLElement), true);
    expect(onEntered).toHaveBeenCalledWith(expect.any(HTMLElement), true);
    expect(screen.getByTestId('state').textContent).toBe('entered');
  });

  it('disabled enter/exit 直接完成，并在 exit 后卸载', () => {
    jest.useFakeTimers();
    const onEntered = jest.fn();
    const onExited = jest.fn();
    const { rerender } = render(
      <Transition in={false} timeout={10} enter={false} unmountOnExit onEntered={onEntered} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    rerender(
      <Transition in timeout={10} enter={false} unmountOnExit onEntered={onEntered} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    expect(onEntered).toHaveBeenCalled();
    rerender(
      <Transition in={false} timeout={10} exit={false} unmountOnExit onEntered={onEntered} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    expect(onExited).toHaveBeenCalled();
    act(() => jest.runOnlyPendingTimers());
    expect(screen.queryByTestId('state')).toBeNull();
  });

  it('nodeRef 下 addEndListener 只接收完成回调，超时后进入 entered', () => {
    jest.useFakeTimers();
    const nodeRef = React.createRef<HTMLDivElement>();
    const addEndListener = jest.fn((_done: () => void) => undefined);
    const onEntered = jest.fn();
    const { rerender } = render(
      <Transition in={false} nodeRef={nodeRef} timeout={8} addEndListener={addEndListener} onEntered={onEntered}>
        {(state) => <div ref={nodeRef} data-testid="state">{state}</div>}
      </Transition>,
    );
    rerender(
      <Transition in nodeRef={nodeRef} timeout={8} addEndListener={addEndListener} onEntered={onEntered}>
        {(state) => <div ref={nodeRef} data-testid="state">{state}</div>}
      </Transition>,
    );
    expect(addEndListener).toHaveBeenCalledWith(expect.any(Function), undefined);
    act(() => jest.advanceTimersByTime(8));
    expect(onEntered).toHaveBeenCalledWith(false, undefined);
    expect(screen.getByTestId('state').textContent).toBe('entered');
  });

  it('标准 addEndListener 接收 node 和完成回调，完成后进入 entered', () => {
    const addEndListener = jest.fn((node: HTMLElement, done: () => void) => {
      expect(node).toBeInstanceOf(HTMLElement);
      done();
    });
    const { rerender } = render(
      <Transition in={false} timeout={null} addEndListener={addEndListener}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    act(() => rerender(
      <Transition in timeout={null} addEndListener={addEndListener}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    ));
    expect(addEndListener).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('state').textContent).toBe('entered');
  });

  it('配置禁用 transition 时跳过 enter/exit 动画', () => {
    const previousDisabled = config.disabled;
    config.disabled = true;
    try {
      const onEntered = jest.fn();
      const onExited = jest.fn();
      const { rerender } = render(
        <Transition in={false} timeout={100} onEntered={onEntered} onExited={onExited}>
          {(state) => <div data-testid="state">{state}</div>}
        </Transition>,
      );
      rerender(
        <Transition in timeout={100} onEntered={onEntered} onExited={onExited}>
          {(state) => <div data-testid="state">{state}</div>}
        </Transition>,
      );
      expect(onEntered).toHaveBeenCalled();
      rerender(
        <Transition in={false} timeout={100} onEntered={onEntered} onExited={onExited}>
          {(state) => <div data-testid="state">{state}</div>}
        </Transition>,
      );
      expect(onExited).toHaveBeenCalled();
    } finally {
      config.disabled = previousDisabled;
    }
  });

  it('Transition PropTypes 校验 nodeRef Element 和带/不带 end listener 的 timeout', () => {
    const errors: string[] = [];
    const errorSpy = jest.spyOn(console, 'error').mockImplementation((message: string) => errors.push(message));
    try {
      // PropTypes validation itself is the behavior under test here.
      // eslint-disable-next-line react/forbid-foreign-prop-types
      const props = Transition.propTypes as Record<string, unknown>;
      PropTypes.checkPropTypes(props as any, {
        children: () => null,
        nodeRef: { current: document.createElement('div') },
        timeout: 10,
      }, 'prop', 'Transition');
      PropTypes.checkPropTypes(props as any, {
        children: () => null,
        nodeRef: { current: document.createElement('div') },
        timeout: null,
        addEndListener: jest.fn(),
      }, 'prop', 'Transition');
      PropTypes.checkPropTypes(props as any, {
        children: () => null,
        nodeRef: { current: {} },
        timeout: 10,
      }, 'prop', 'Transition');
      expect(errors).toHaveLength(1);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('Transition 在 TransitionGroup 上下文中按 isMounting 决定 appear', () => {
    const props = {
      in: true,
      appear: false,
      enter: true,
      timeout: { enter: 4, exit: 0 },
      onEnter: jest.fn(),
      onEntering: jest.fn(),
      onEntered: jest.fn(),
      onExit: jest.fn(),
      onExiting: jest.fn(),
      onExited: jest.fn(),
      children: () => null,
    } as any;
    const mounting = new (Transition as any)(props, { isMounting: true });
    const updated = new (Transition as any)(props, { isMounting: false });
    expect(mounting.state.status).toBe('entered');
    expect(updated.state.status).toBe('exited');
    expect(updated.appearStatus).toBe('entering');
    expect(updated.getTimeouts()).toEqual({ enter: 4, exit: 0, appear: 4 });
    updated.updateStatus(undefined, null);
    updated.componentDidUpdate(updated.props);
    updated.componentWillUnmount();
  });

  it('Transition uses the parent TransitionGroup mounting context', () => {
    const onEntered = jest.fn();
    const child = (inProp: boolean) => (
      <Transition in={inProp} enter={false} timeout={null} onEntered={onEntered}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>
    );
    const { rerender } = render(
      <TransitionGroupContext.Provider value={{ isMounting: false }}>
        {child(false)}
      </TransitionGroupContext.Provider>,
    );
    rerender(
      <TransitionGroupContext.Provider value={{ isMounting: false }}>
        {child(true)}
      </TransitionGroupContext.Provider>,
    );
    expect(onEntered).toHaveBeenCalled();
    expect(screen.getByTestId('state').textContent).toBe('entered');
  });

  it('节点或 timeout/listener 缺失时异步完成，元素 children 会被克隆并过滤内部 props', () => {
    jest.useFakeTimers();
    const { rerender } = render(
      <Transition in={false} mountOnEnter timeout={null} data-view="kept">
        <div data-testid="element">initial</div>
      </Transition>,
    );
    expect(screen.queryByTestId('element')).toBeNull();
    rerender(
      <Transition in timeout={null} data-view="kept">
        <div data-testid="element">entered</div>
      </Transition>,
    );
    act(() => jest.runOnlyPendingTimers());
    expect(screen.getByTestId('element').textContent).toBe('entered');
    expect(screen.getByTestId('element').getAttribute('data-view')).toBe('kept');
  });

  it('切换方向时取消旧回调，配置禁用时同步完成', () => {
    jest.useFakeTimers();
    const onExited = jest.fn();
    const { rerender } = render(
      <Transition in timeout={100} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    rerender(
      <Transition in={false} timeout={100} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    rerender(
      <Transition in timeout={100} onExited={onExited}>
        {(state) => <div data-testid="state">{state}</div>}
      </Transition>,
    );
    act(() => jest.runOnlyPendingTimers());
    expect(onExited).not.toHaveBeenCalled();
  });
});
