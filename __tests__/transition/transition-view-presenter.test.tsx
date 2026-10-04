import React from 'react';
import { act, render, screen } from '@testing-library/react';
import TransitionPresenter from '../../transition/src/TransitionPresenter';
import TransitionViewPresenter from '../../transition/src/TransitionViewPresenter';

describe('TransitionViewPresenter 退场快照', () => {
  it('未提供 presenter context 时直接渲染 children', () => {
    render(<TransitionPresenter><span data-testid="plain-presenter">plain</span></TransitionPresenter>);
    expect(screen.getByTestId('plain-presenter').textContent).toBe('plain');
  });

  it('commits the slide entrance offset before enabling its duration', () => {
    const startingDurations: string[] = [];
    const getRect = HTMLElement.prototype.getBoundingClientRect;
    const spy = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function measure(this: HTMLElement) {
        if (this.classList.contains('react-view-router-slide-left-enter')
          && !this.classList.contains('react-view-router-slide-left-enter-active')) {
          startingDurations.push(this.style.transitionDuration);
        }
        return getRect.call(this);
      });
    const transitionMap = {
      mode: 'in-out',
      props: { classNames: 'react-view-router-slide-left', timeout: 900 },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      route: { path }, transitionMap, containerTag: 'div', containerStyle: {},
    }, React.createElement('div', null, path));
    try {
      const { rerender, unmount } = render(page('a'));
      rerender(page('b'));
      expect(startingDurations).toEqual(['']);
      const entering = document.querySelector('.react-view-router-slide-left-enter') as HTMLElement;
      expect(entering.style.transitionDuration).toBe('900ms');
      unmount();
    } finally {
      spy.mockRestore();
    }
  });

  it('uses the supplied duration for CSS and the fallback timer', () => {
    jest.useFakeTimers();
    const transitionMap = {
      mode: 'out-in',
      props: { classNames: 'react-view-router-fade', timeout: 900 },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      route: { path }, transitionMap, containerTag: 'div', containerStyle: {},
    }, React.createElement('div', null, path));
    try {
      const { rerender, unmount } = render(page('a'));
      rerender(page('b'));
      const outgoing = document.querySelector('.react-view-router-fade-exit') as HTMLElement;
      const incoming = document.querySelector('.react-view-router-fade-enter') as HTMLElement;
      expect(outgoing.style.transitionDuration).toBe('900ms');
      expect(incoming.style.transitionDuration).toBe('900ms');
      act(() => jest.advanceTimersByTime(350));
      expect(document.querySelector('.react-view-router-fade-exit')).toBeTruthy();
      act(() => jest.advanceTimersByTime(600));
      expect(document.querySelector('.react-view-router-fade-exit')).toBeNull();
      expect(incoming.style.transitionDuration).toBe('');
      unmount();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not create a snapshot animation when the transition has no class names', () => {
    const onExit = jest.fn();
    const onEnter = jest.fn();
    const transitionMap = {
      mode: 'in-out',
      props: { onExit, onEnter },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      route: { path }, transitionMap, containerTag: 'div', containerStyle: {},
    }, React.createElement('span', { 'data-testid': 'plain-route' }, path));

    const { rerender, unmount } = render(page('first'));
    rerender(page('second'));

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onEnter).not.toHaveBeenCalled();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getAllByTestId('plain-route')).toHaveLength(1);
    unmount();
  });

  it('calls onEntering for the new page when an animated transition starts', () => {
    const onEntering = jest.fn();
    const transitionMap = {
      mode: 'in-out',
      props: { classNames: 'react-view-router-fade', onEntering },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      route: { path }, transitionMap, containerTag: 'div', containerStyle: {},
    }, React.createElement('span', null, path));

    const { rerender, unmount } = render(page('/before'));
    rerender(page('/after'));

    expect(onEntering).toHaveBeenCalledTimes(1);
    expect(onEntering.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
    unmount();
  });

  it('does not snapshot when the route identity has not changed', () => {
    const onExit = jest.fn();
    const transitionMap = {
      mode: 'in-out',
      props: { classNames: 'react-view-router-fade', onExit },
    };
    const page = (content: string) => React.createElement(TransitionViewPresenter, {
      route: { path: '/same' }, transitionMap, containerTag: 'div', containerStyle: {},
    }, React.createElement('span', null, content));

    const { rerender, unmount } = render(page('before'));
    rerender(page('after'));

    expect(onExit).not.toHaveBeenCalled();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText('after')).toBeTruthy();
    unmount();
  });

  it('只保留旧页视觉副本，并复制滚动位置', () => {
    const listeners: Array<() => void> = [];
    const onExit = jest.fn();
    const transitionMap = {
      mode: 'in-out',
      props: {
        classNames: 'react-view-router-slide-left',
        timeout: 300,
        onExit,
        addEndListener: (_node: HTMLElement, done: () => void) => { listeners.push(done); },
      },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      route: { path },
      transitionMap,
      containerTag: 'div',
      containerStyle: {},
    }, React.createElement('div', { 'data-testid': `page-${path}` }, path));

    const { rerender, unmount } = render(page('a'));
    const firstPage = screen.getByTestId('page-a');
    firstPage.scrollTop = 43;
    rerender(page('b'));

    const firstSnapshot = document.querySelector('[aria-hidden="true"] [data-testid="page-a"]') as HTMLElement;
    expect(firstSnapshot).toBeTruthy();
    expect(firstSnapshot).not.toBe(firstPage);
    expect(firstSnapshot.scrollTop).toBe(43);
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('page-b')).toBeTruthy();

    rerender(page('c'));
    expect(document.querySelector('[aria-hidden="true"] [data-testid="page-a"]')).toBeNull();
    expect(document.querySelector('[aria-hidden="true"] [data-testid="page-b"]')).toBeTruthy();
    listeners[0]();
    expect(document.querySelector('[aria-hidden="true"] [data-testid="page-b"]')).toBeTruthy();
    listeners[1]();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    unmount();
  });

  it('finishes a detached outgoing snapshot without requiring a current node', () => {
    const presenterRef = React.createRef<TransitionViewPresenter>();
    const transitionMap = {
      mode: 'in-out',
      props: { classNames: 'react-view-router-fade', timeout: 300 },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      ref: presenterRef,
      route: { path },
      transitionMap,
      containerTag: 'div',
      containerStyle: {},
    }, React.createElement('span', null, path));

    const { rerender, unmount } = render(page('/before'));
    rerender(page('/after'));
    const outgoing = presenterRef.current?.snapshotNode;
    expect(outgoing?.parentNode).toBeTruthy();

    outgoing?.parentNode?.removeChild(outgoing);
    presenterRef.current!.currentNode = null;
    act(() => presenterRef.current!.finishAnimation());

    expect(presenterRef.current?.snapshotNode).toBeNull();
    unmount();
  });

  it('preserves unrelated classes while clearing the transition classes', () => {
    const presenterRef = React.createRef<TransitionViewPresenter>();
    let finish: (() => void) | undefined;
    const transitionMap = {
      mode: 'in-out',
      props: {
        classNames: 'react-view-router-fade',
        addEndListener: (_node: HTMLElement, done: () => void) => { finish = done; },
      },
    };
    const page = (path: string) => React.createElement(TransitionViewPresenter, {
      ref: presenterRef,
      route: { path },
      transitionMap,
      containerTag: 'div',
      containerStyle: {},
    }, React.createElement('span', null, path));

    const { rerender, unmount } = render(page('/before'));
    presenterRef.current!.currentNode!.classList.add('user-page-class');
    rerender(page('/after'));
    act(() => finish?.());

    expect(presenterRef.current!.currentNode!.classList.contains('user-page-class')).toBe(true);
    expect(presenterRef.current!.currentNode!.classList.contains('react-view-router-fade-enter')).toBe(false);
    unmount();
  });
});
