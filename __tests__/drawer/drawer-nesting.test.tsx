import React from 'react';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import Drawer from '../../drawer/src/drawer';

const props = { open: true, prefixCls: 'rvr-route-drawer', touch: true };
function swipe(panel: HTMLElement, dx: number, dy = 0) {
  fireEvent.touchStart(panel, { touches: [{ clientX: 200, clientY: 200 }] });
  fireEvent.touchMove(panel, { touches: [{ clientX: 200 + dx, clientY: 200 + dy }] });
  fireEvent.touchEnd(panel, { changedTouches: [{ clientX: 200 + dx, clientY: 200 + dy }] });
}
function bounds(panel: HTMLElement) {
  Object.defineProperty(panel, 'getBoundingClientRect', { value: () => ({ width: 300, height: 400 }) });
}
describe('drawer centered panels and nested interaction', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { cleanup(); jest.useRealTimers(); document.body.style.overflow = ''; });

  it('centers CSS dimensions and never swipes to close', () => {
    const onClose = jest.fn();
    const view = render(<Drawer {...props} position="center" onClose={onClose}
      transitionName="rvr-drawer-center" style={{ maxWidth: '80vw', maxHeight: 'calc(100% - 48px)' }}>center</Drawer>);
    const panel = view.container.querySelector('.rvr-route-drawer') as HTMLElement;
    bounds(panel);
    expect(panel.style.maxWidth).toBe('80vw');
    expect(panel.style.maxHeight).toBe('calc(100% - 48px)');
    const frame = panel.parentElement!;
    expect(frame.style.alignItems).toBe('center');
    expect(frame.style.justifyContent).toBe('center');
    expect(panel.className).toContain('rvr-drawer-center-enter');
    swipe(panel, 200);
    act(() => jest.runAllTimers());
    expect(panel.style.transform).toBe('');
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(['short', 'reverse', 'cancel'])('restores after a %s gesture using custom delay', (kind) => {
    const onClose = jest.fn();
    const view = render(<Drawer {...props} delay={75} onClose={onClose}>panel</Drawer>);
    const panel = view.container.querySelector('.rvr-route-drawer') as HTMLElement;
    bounds(panel);
    if (kind === 'short') swipe(panel, 5);
    else {
      fireEvent.touchStart(panel, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(panel, { touches: [{ clientX: 170, clientY: 100 }] });
      if (kind === 'cancel') fireEvent.touchCancel(panel);
      else {
        fireEvent.touchMove(panel, { touches: [{ clientX: 80, clientY: 100 }] });
        fireEvent.touchEnd(panel, { changedTouches: [{ clientX: 80, clientY: 100 }] });
      }
    }
    expect(panel.style.transitionDuration).toBe('75ms');
    act(() => jest.advanceTimersByTime(75));
    expect(panel.style.transform).toBe('');
    expect(panel.classList.contains('touched')).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([false, true])('inner touch=%s owns gestures and backdrop clicks including portals', (touch) => {
    const outerClose = jest.fn();
    const innerClose = jest.fn();
    render(<Drawer {...props} onClose={outerClose} maskClosable portalContainer={() => document.body}>
      <Drawer {...props} touch={touch} onClose={innerClose} maskClosable portalContainer={() => document.body}>inner</Drawer>
    </Drawer>);
    const panels = Array.from(document.querySelectorAll('.rvr-route-drawer')) as HTMLElement[];
    const inner = panels.find((panel) => panel.textContent === 'inner' && !panel.querySelector('.rvr-route-drawer'))!;
    panels.forEach(bounds);
    swipe(inner, 200);
    act(() => jest.runAllTimers());
    expect(innerClose).toHaveBeenCalledTimes(touch ? 1 : 0);
    expect(outerClose).not.toHaveBeenCalled();
    fireEvent.click(inner);
    expect(outerClose).not.toHaveBeenCalled();
    fireEvent.click(inner.closest('.rvr-route-drawer-mask')!);
    expect(innerClose).toHaveBeenCalledTimes(touch ? 2 : 1);
    expect(outerClose).not.toHaveBeenCalled();
  });

  it.each([true, false])('keeps the body locked when %s outer-first unmount order removes one owner', (outerFirst) => {
    document.body.style.overflow = 'scroll';
    const first = render(<Drawer {...props} portalContainer={() => document.body}>first</Drawer>);
    const second = render(<Drawer {...props} portalContainer={() => document.body}>second</Drawer>);
    expect(document.body.style.overflow).toBe('hidden');
    (outerFirst ? first : second).unmount();
    expect(document.body.style.overflow).toBe('hidden');
    (outerFirst ? second : first).unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('unmount cancels a pending swipe close', () => {
    const onClose = jest.fn();
    const view = render(<Drawer {...props} onClose={onClose}>panel</Drawer>);
    const panel = view.container.querySelector('.rvr-route-drawer') as HTMLElement;
    bounds(panel);
    swipe(panel, 200);
    view.unmount();
    act(() => jest.runAllTimers());
    expect(onClose).not.toHaveBeenCalled();
  });
});
