import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import Drawer from '../../drawer/src/drawer';

describe('Drawer 组件', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('显式提供 body getter 时渲染到 portal', () => {
    render(
      React.createElement(
        Drawer,
        { open: true, portalContainer: () => document.body },
        React.createElement('div', { 'data-testid': 'drawer-content' }, 'content'),
      ),
    );
    expect(screen.getByTestId('drawer-content')).toBeTruthy();
    expect(document.body.querySelector('.rvr-drawer-mask-inline')).toBeNull();
  });

  it('未提供 portalContainer 时在父容器内展示且初次打开有进入动画', () => {
    jest.useFakeTimers();
    const { container, unmount } = render(React.createElement(
      'div',
      { 'data-testid': 'drawer-viewport' },
      React.createElement(Drawer, {
        open: true,
        prefixCls: 'rvr-route-drawer',
        transitionName: 'rvr-slide-right',
      }, React.createElement('div', { 'data-testid': 'drawer-content' }, 'content'))
    ));
    expect(container.querySelector('.rvr-route-drawer-mask-inline')).toBeTruthy();
    expect(container.querySelector('.rvr-slide-right-enter')).toBeTruthy();
    expect(document.querySelector('[id^="rvr-route-drawer-container-"]')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    act(() => jest.advanceTimersByTime(20));
    expect(container.querySelector('.rvr-slide-right-enter-active')).toBeTruthy();
    unmount();
    jest.useRealTimers();
  });

  it('可将抽屉 portal 到指定的局部容器', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const view = render(React.createElement(Drawer, {
      open: true,
      portalContainer: () => target,
      prefixCls: 'rvr-route-drawer',
    }, 'content'));
    expect(target.querySelector('.rvr-route-drawer-mask-inline')).toBeTruthy();
    expect(document.body.style.overflow).toBe('');
    view.unmount();
    target.remove();
  });

  it('open 为 false 时不渲染内容', () => {
    render(
      React.createElement(
        Drawer,
        { open: false, animation: 'slide-right' },
        React.createElement('div', { 'data-testid': 'drawer-content' }, 'content'),
      ),
    );
    expect(screen.queryByTestId('drawer-content')).toBeNull();
  });

  it('getTransitionName 应使用 animation 生成名称', () => {
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        animation: 'slide-right',
        ref,
      }, 'x'),
    );
    expect(ref.current?.getTransitionName()).toBe('rvr-drawer-slide-right');
  });

  it('getMaskTransitionName 应使用 maskAnimation', () => {
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        mask: true,
        maskAnimation: 'fade',
        ref,
      }, 'x'),
    );
    expect(ref.current?.getMaskTransitionName()).toBe('rvr-drawer-fade');
  });

  it('applies native mask animation classes while opening', () => {
    jest.useFakeTimers();
    const props = { maskAnimation: 'fade', delay: 400 };
    const { rerender, unmount } = render(React.createElement(Drawer, {
      ...props, open: false,
    }, 'content'));
    rerender(React.createElement(Drawer, { ...props, open: true }, 'content'));
    expect(document.querySelector('.rvr-drawer-fade-enter')).toBeTruthy();
    act(() => jest.advanceTimersByTime(20));
    expect(document.querySelector('.rvr-drawer-fade-enter-active')).toBeTruthy();
    unmount();
    jest.useRealTimers();
  });

  it.each([
    ['mask', true, '.rvr-drawer-mask-inline'],
    ['positioning container', false, '.rvr-drawer-container-inline'],
  ])('%s touch handlers stop events from reaching the parent', (_label, mask, selector) => {
    const parentHandlers = {
      start: jest.fn(), move: jest.fn(), end: jest.fn(), cancel: jest.fn(),
    };
    const { container } = render(React.createElement('div', {
      onTouchStart: parentHandlers.start,
      onTouchMove: parentHandlers.move,
      onTouchEnd: parentHandlers.end,
      onTouchCancel: parentHandlers.cancel,
    }, React.createElement(Drawer, {
      open: true,
      mask: mask as boolean,
      portalContainer: () => null,
    }, 'content')));
    const wrapper = container.querySelector(selector as string)!;

    fireEvent.touchStart(wrapper, { touches: [{ clientX: 10, clientY: 10 }] });
    fireEvent.touchMove(wrapper, { touches: [{ clientX: 20, clientY: 10 }] });
    fireEvent.touchEnd(wrapper, { changedTouches: [{ clientX: 20, clientY: 10 }] });
    fireEvent.touchCancel(wrapper, { changedTouches: [{ clientX: 20, clientY: 10 }] });

    Object.values(parentHandlers).forEach(handler => expect(handler).not.toHaveBeenCalled());
  });

  it('maskClosable 点击遮罩应触发 onClose', () => {
    const onClose = jest.fn();
    render(
      React.createElement(Drawer, {
        open: true,
        mask: true,
        maskClosable: true,
        onClose,
      }, React.createElement('div', null, 'inner')),
    );
    const mask = document.querySelector('.rvr-drawer-mask');
    expect(mask).toBeTruthy();
    fireEvent.click(mask!);
    expect(onClose).toHaveBeenCalled();
  });

  it('onAnimateAppear 应隐藏 body 滚动', () => {
    const ref = React.createRef<Drawer>();
    render(React.createElement(Drawer, { open: true, ref, portalContainer: () => document.body }, 'x'));
    act(() => ref.current?.onAnimateAppear());
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('onAnimateLeave 应恢复 overflow 并回调', () => {
    const onAnimateLeave = jest.fn();
    const afterClose = jest.fn();
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        onAnimateLeave,
        portalContainer: () => document.body,
        afterClose,
        ref,
      }, 'x'),
    );
    document.body.style.overflow = 'hidden';
    act(() => ref.current?.onAnimateLeave());
    expect(document.body.style.overflow).toBe('');
    expect(onAnimateLeave).toHaveBeenCalled();
    expect(afterClose).toHaveBeenCalled();
  });

  it('onTouchMove 右滑应更新 transform', () => {
    const ref = React.createRef<Drawer>();
    render(React.createElement(Drawer, { open: true, touch: true, ref }, 'x'));
    const el = document.querySelector('.rvr-drawer') as HTMLElement;
    expect(el).toBeTruthy();
    act(() => ref.current?.onTouchMove({ dir: 'Right', deltaX: -20 }));
    expect(el.style.transform).toContain('translateX');
  });

  it('onTouchEnd 超过阈值应关闭', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        touch: true,
        touchThreshold: 10,
        onClose,
        ref,
      }, 'x'),
    );
    const el = document.querySelector('.rvr-drawer') as HTMLElement;
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 600, top: 0, left: 0, right: 300, bottom: 600 }),
    });
    act(() => {
      ref.current?.onTouchMove({ dir: 'Right', deltaX: -200 });
      ref.current?.onTouchEnd({ dir: 'Right', deltaX: -200 });
    });
    act(() => jest.runAllTimers());
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('uses native touch events to close after a right swipe', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const { unmount } = render(React.createElement(Drawer, {
      open: true, touch: true, onClose,
    }, 'content'));
    const wrap = document.querySelector('.rvr-drawer-wrap') as HTMLElement;
    const panel = document.querySelector('.rvr-drawer') as HTMLElement;
    Object.defineProperty(panel, 'getBoundingClientRect', {
      value: () => ({ width: 300 }),
    });
    fireEvent.touchStart(wrap, { touches: [{ clientX: 10, clientY: 20 }] });
    fireEvent.touchMove(wrap, { touches: [{ clientX: 210, clientY: 22 }] });
    fireEvent.touchEnd(wrap, { changedTouches: [{ clientX: 210, clientY: 22 }] });
    act(() => jest.runAllTimers());
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    jest.useRealTimers();
  });

  it('ignores vertical and leftward native swipes', () => {
    const onClose = jest.fn();
    render(React.createElement(Drawer, { open: true, touch: true, onClose }, 'content'));
    const wrap = document.querySelector('.rvr-drawer-wrap') as HTMLElement;
    const panel = document.querySelector('.rvr-drawer') as HTMLElement;
    fireEvent.touchStart(wrap, { touches: [{ clientX: 100, clientY: 10 }] });
    fireEvent.touchMove(wrap, { touches: [{ clientX: 102, clientY: 100 }] });
    fireEvent.touchEnd(wrap, { changedTouches: [{ clientX: 102, clientY: 100 }] });
    fireEvent.touchStart(wrap, { touches: [{ clientX: 100, clientY: 10 }] });
    fireEvent.touchMove(wrap, { touches: [{ clientX: 20, clientY: 12 }] });
    fireEvent.touchEnd(wrap, { changedTouches: [{ clientX: 20, clientY: 12 }] });
    expect(panel.style.transform).toBe('');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps content during the native exit animation, then removes the portal', () => {
    jest.useFakeTimers();
    const afterClose = jest.fn();
    const props = { transitionName: 'rvr-slide-right', delay: 400, afterClose };
    const { rerender, unmount } = render(React.createElement(Drawer, {
      ...props, open: false,
    }, 'content'));
    rerender(React.createElement(Drawer, { ...props, open: true }, 'content'));
    expect(document.querySelector('.rvr-slide-right-enter')).toBeTruthy();
    act(() => jest.advanceTimersByTime(20));
    expect(document.querySelector('.rvr-slide-right-enter-active')).toBeTruthy();
    rerender(React.createElement(Drawer, { ...props, open: false }, 'content'));
    expect(document.querySelector('.rvr-slide-right-leave')).toBeTruthy();
    act(() => jest.advanceTimersByTime(20));
    fireEvent.animationEnd(document.querySelector('.rvr-drawer') as HTMLElement);
    expect(document.querySelector('.rvr-drawer')).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
    act(() => jest.runAllTimers());
    expect(afterClose).toHaveBeenCalledTimes(1);
    unmount();
    jest.useRealTimers();
  });

  it('ends the enter phase on animationend and uses a timer when exit has no event', () => {
    jest.useFakeTimers();
    const afterClose = jest.fn();
    const props = { transitionName: 'rvr-slide-right', delay: 400, afterClose };
    const { rerender, unmount } = render(React.createElement(Drawer, {
      ...props, open: false,
    }, 'content'));
    rerender(React.createElement(Drawer, { ...props, open: true }, 'content'));
    act(() => jest.advanceTimersByTime(20));
    fireEvent.animationEnd(document.querySelector('.rvr-drawer') as HTMLElement);
    expect(document.querySelector('.rvr-slide-right-enter-active')).toBeNull();
    rerender(React.createElement(Drawer, { ...props, open: false }, 'content'));
    act(() => jest.advanceTimersByTime(400));
    expect(document.querySelector('.rvr-drawer')).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
    unmount();
    jest.useRealTimers();
  });

  it('closes immediately when no animation is configured', () => {
    const afterClose = jest.fn();
    const { rerender } = render(React.createElement(Drawer, {
      open: true, afterClose,
    }, 'content'));
    rerender(React.createElement(Drawer, { open: false, afterClose }, 'content'));
    expect(document.querySelector('.rvr-drawer')).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it('卸载时保留外部容器，并恢复 body 原有 overflow', () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = render(React.createElement(Drawer, {
      open: true, portalContainer: () => document.body,
    }, 'x'));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.isConnected).toBe(true);
  });

  it('getter 返回 null 时在当前位置渲染，不修改 body overflow', () => {
    const { container } = render(React.createElement(Drawer, {
      open: true, portalContainer: () => null,
    }, 'x'));
    expect(container.querySelector('.rvr-drawer-mask-inline')).toBeTruthy();
    expect(document.body.style.overflow).toBe('');
  });

  it.each([
    ['right', 210, 100, 'translateX(200px)'], ['left', -110, 100, 'translateX(-120px)'],
    ['bottom', 10, 220, 'translateY(120px)'], ['top', 10, -20, 'translateY(-120px)'],
  ])('%s 方向手势使用正确坐标轴关闭', (position, x, y, transform) => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const view = render(React.createElement(Drawer, { open: true, position: position as any, touch: true, onClose }, 'content'));
    try {
      const wrap = view.container.querySelector('.rvr-drawer-wrap') as HTMLElement;
      const panel = view.container.querySelector('.rvr-drawer') as HTMLElement;
      panel.getBoundingClientRect = () => ({ width: 200, height: 200 } as DOMRect);
      fireEvent.touchStart(wrap, { touches: [{ clientX: 10, clientY: 100 }] });
      fireEvent.touchMove(wrap, { touches: [{ clientX: x, clientY: y }] });
      expect(panel.style.transform).toBe(transform);
      fireEvent.touchEnd(wrap, { changedTouches: [{ clientX: x, clientY: y }] });
      act(() => jest.runAllTimers());
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally { view.unmount(); jest.useRealTimers(); }
  });

  it.each([
    ['right', 'center', 'flex-end'], ['left', 'center', 'flex-start'],
    ['bottom', 'flex-end', 'center'], ['top', 'flex-start', 'center'],
  ])('%s 方向按边缘对齐面板并限制尺寸', (position, alignItems, justifyContent) => {
    const { container } = render(React.createElement(Drawer, {
      open: true,
      position: position as any,
      transitionName: `rvr-slide-${position}`,
      style: { maxWidth: 320, maxHeight: '70%' },
    }, 'content'));
    const mask = container.querySelector('.rvr-drawer-mask') as HTMLElement;
    const wrap = container.querySelector('.rvr-drawer-wrap') as HTMLElement;
    const panel = container.querySelector('.rvr-drawer') as HTMLElement;
    expect(mask.style.alignItems).toBe(alignItems);
    expect(wrap.style.justifyContent).toBe(justifyContent);
    expect(panel.style.maxWidth).toBe('320px');
    expect(panel.style.maxHeight).toBe('70%');
    expect(panel.classList.contains(`rvr-slide-${position}-enter`)).toBe(true);
  });

  it('打开期间切换为就地渲染时释放 body 滚动锁', () => {
    const view = render(React.createElement(Drawer, {
      open: true, portalContainer: () => document.body,
    }, 'x'));
    expect(document.body.style.overflow).toBe('hidden');
    view.rerender(React.createElement(Drawer, { open: true }, 'x'));
    expect(view.container.querySelector('.rvr-drawer-mask-inline')).toBeTruthy();
    expect(document.body.style.overflow).toBe('');
  });

  it('onTouchMove 非右滑方向应忽略', () => {
    const ref = React.createRef<Drawer>();
    render(React.createElement(Drawer, { open: true, touch: true, ref }, 'x'));
    const el = document.querySelector('.rvr-drawer') as HTMLElement;
    act(() => ref.current?.onTouchMove({ dir: 'Left', deltaX: 20 }));
    expect(el.style.transform).toBe('');
  });

  it('onTouchEnd 小幅滑动应恢复位置不关闭', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        touch: true,
        touchThreshold: 10,
        onClose,
        ref,
      }, 'x'),
    );
    const el = document.querySelector('.rvr-drawer') as HTMLElement;
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 300, height: 600, top: 0, left: 0, right: 300, bottom: 600 }),
    });
    act(() => {
      ref.current?.onTouchMove({ dir: 'Right', deltaX: -15 });
      ref.current?.onTouchEnd({ dir: 'Right', deltaX: -15 });
    });
    act(() => jest.runAllTimers());
    expect(onClose).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('getZIndexStyle 无 zIndex 应返回空对象', () => {
    const ref = React.createRef<Drawer>();
    render(React.createElement(Drawer, { open: true, ref }, 'x'));
    expect(ref.current?.getZIndexStyle()).toEqual({});
  });

  it('getWrapStyle 应合并 wrapStyle 与 zIndex', () => {
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        zIndex: 100,
        wrapStyle: { color: 'red' },
        ref,
      }, 'x'),
    );
    expect(ref.current?.getWrapStyle()).toMatchObject({ zIndex: 100, color: 'red' });
  });

  it('maskClosable 点击内部元素不应关闭', () => {
    const onClose = jest.fn();
    render(
      React.createElement(Drawer, {
        open: true,
        mask: true,
        maskClosable: true,
        onClose,
      }, React.createElement('div', { 'data-testid': 'inner' }, 'inner')),
    );
    fireEvent.click(screen.getByTestId('inner'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closed 时 getTransitionName 应返回空字符串', () => {
    const ref = React.createRef<Drawer>();
    render(
      React.createElement(Drawer, {
        open: true,
        animation: 'slide',
        ref,
      }, 'x'),
    );
    ref.current!.closed = true;
    expect(ref.current?.getTransitionName()).toBe('');
    expect(ref.current?.getMaskTransitionName()).toBe('');
  });

  it('touch 为 false 时不包裹 Swipeable', () => {
    render(
      React.createElement(
        Drawer,
        { open: true, touch: false },
        React.createElement('div', { 'data-testid': 'no-touch' }, 'x'),
      ),
    );
    expect(screen.getByTestId('no-touch')).toBeTruthy();
    expect(document.querySelector('.rvr-drawer-wrap')).toBeNull();
  });

  it('覆盖无 touch 数据、未挂载手势节点及无回调时的安全分支', () => {
    const ref = React.createRef<Drawer>();
    render(React.createElement(Drawer, { open: true, touch: true, ref }, 'x'));
    const drawer = ref.current!;
    drawer.onTouchStart({ touches: [] } as any);
    drawer.onNativeTouchMove({ touches: [] } as any);
    drawer.onNativeTouchEnd({ changedTouches: [] } as any);
    drawer.onTouchMove({ dir: 'Right', deltaX: 20 });
    drawer.isTouching = true;
    drawer.drawerRef = null;
    drawer.onTouchEnd({ dir: 'Right', deltaX: -30 });
    expect(drawer.getWrapStyle()).toEqual({});
    expect(drawer.touchStart).toBeNull();
    expect(drawer.isTouching).toBeNull();
    expect(() => drawer.close()).not.toThrow();
  });

  it('忽略子元素 animationend 且无 mask 时仍正常渲染面板', () => {
    const ref = React.createRef<Drawer>();
    const { container } = render(React.createElement(Drawer, {
      open: true, mask: false, ref,
    }, 'content'));
    const panel = container.querySelector('.rvr-drawer')!;
    const child = panel.firstElementChild!;
    ref.current!.onPanelAnimationEnd({ target: child, currentTarget: panel } as any);
    expect(container.querySelector('.rvr-drawer-mask')).toBeNull();
    expect(panel).toBeTruthy();
  });

  it('body portal 无遮罩时不锁滚动，并在动态移除遮罩时恢复滚动', () => {
    document.body.style.overflow = 'auto';
    const { rerender, unmount } = render(React.createElement(Drawer, {
      open: true, mask: false, portalContainer: () => document.body,
    }, 'content'));
    expect(document.body.style.overflow).toBe('auto');
    expect(document.querySelector('.rvr-drawer-container-inline')).toBeNull();
    const panel = document.querySelector('.rvr-drawer');
    rerender(React.createElement(Drawer, {
      open: true, mask: true, portalContainer: () => document.body,
    }, 'content'));
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.querySelector('.rvr-drawer')).toBe(panel);
    rerender(React.createElement(Drawer, {
      open: true, mask: false, portalContainer: () => document.body,
    }, 'content'));
    expect(document.body.style.overflow).toBe('auto');
    expect(document.querySelector('.rvr-drawer')).toBe(panel);
    unmount();
    document.body.style.overflow = '';
  });
});
