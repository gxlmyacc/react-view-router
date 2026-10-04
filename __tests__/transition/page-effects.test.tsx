import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import RouterViewTransition from '../../transition/src/RouterView';
import type { TransitionName } from '../../transition/types/router-view';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from '../helpers/test-utils';

const effects: Array<[TransitionName, string, string]> = [
  ['fade-slide', 'fade-slide-left', 'fade-slide-right'],
  ['zoom', 'zoom-in', 'zoom-out'],
  ['fade-through', 'fade-through', 'fade-through'],
  ['slide-up', 'slide-up', 'slide-up-back'],
  ['slide-down', 'slide-down', 'slide-down-back'],
];

function nodes(name: string) {
  return {
    entering: document.querySelector(`.react-view-router-${name}-enter`) as HTMLElement,
    outgoing: document.querySelector(`.react-view-router-${name}-exit`) as HTMLElement,
  };
}

function endTransition(node: HTMLElement, propertyName = 'transform') {
  // JSDOM has no TransitionEvent constructor; expose the native event's property name explicitly.
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', { value: propertyName });
  fireEvent(node, event);
}

describe('Additional page effects', () => {
  it.each(effects)('%s animates PUSH and POP, then removes its snapshot and inline timing', async (transition, forward, back) => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    const view = renderWithRouter(React.createElement(RouterViewTransition, {
      router, transition, transitionDuration: 1000,
    }), router);
    try {
      await screen.findByTestId('home');
      await act(async () => { await new Promise<void>((resolve) => { router.push('/about', resolve); }); });
      const { entering, outgoing } = nodes(forward);
      expect(entering).toBeTruthy();
      expect(outgoing.getAttribute('aria-hidden')).toBe('true');
      if (transition === 'fade-through') {
        expect(outgoing.style.transitionDuration).toBe('400ms');
        expect(entering.style.transitionDuration).toBe('600ms');
        expect(entering.style.transitionDelay).toBe('400ms');
        act(() => endTransition(outgoing, 'opacity'));
        expect(outgoing.parentNode).toBeTruthy();
      } else {
        expect(entering.style.transitionDuration).toBe('1000ms');
      }
      act(() => endTransition(entering));
      expect(outgoing.parentNode).toBeNull();
      expect(entering.style.transitionDuration).toBe('');
      expect(entering.style.transitionDelay).toBe('');

      act(() => router.back());
      await waitFor(() => expect(router.currentRoute?.path).toBe('/'));
      const returning = nodes(back);
      expect(returning.entering).toBeTruthy();
      const vertical = transition === 'slide-up' || transition === 'slide-down';
      // On POP the covering page exits; the revealed page has no transform animation.
      const target = vertical ? returning.outgoing : returning.entering;
      if (vertical) {
        act(() => endTransition(returning.entering));
        expect(returning.outgoing.parentNode).toBeTruthy();
      }
      act(() => endTransition(target));
      expect(returning.outgoing.parentNode).toBeNull();
      expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    } finally {
      view.unmount();
      router.stop();
    }
  });

  it.each(effects)('%s can be selected as a REPLACE fallback', async (fallback, forward) => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    const view = renderWithRouter(React.createElement(RouterViewTransition, {
      router, transition: 'slide', transitionFallback: () => fallback, transitionDuration: 1000,
    }), router);
    try {
      await screen.findByTestId('home');
      await act(async () => { await new Promise<void>((resolve) => { router.replace('/about', resolve); }); });
      if (fallback === 'slide-up' || fallback === 'slide-down') {
        expect(await screen.findByTestId('about')).toBeTruthy();
      } else {
        const { entering, outgoing } = nodes(forward);
        expect(entering).toBeTruthy();
        if (fallback === 'fade-through') expect(entering.style.transitionDelay).toBe('400ms');
        act(() => endTransition(entering, 'opacity'));
        expect(outgoing.parentNode).toBeNull();
      }
    } finally {
      view.unmount();
      router.stop();
    }
  });

  it('cleans delayed fade-through styles when a faster navigation supersedes it', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
      { path: '/third', component: Home },
    ]);
    syncNavigate(router, '/');
    const page = (transition: TransitionName) => React.createElement(RouterViewTransition, {
      router, transition, transitionDuration: 1000,
    });
    const view = renderWithRouter(page('fade-through'), router);
    try {
      await screen.findByTestId('home');
      await act(async () => { await new Promise<void>((resolve) => { router.push('/about', resolve); }); });
      const oldSnapshot = nodes('fade-through').outgoing;
      view.rerender(page('zoom'));
      await act(async () => { await new Promise<void>((resolve) => { router.push('/third', resolve); }); });
      const current = nodes('zoom-in');
      expect(oldSnapshot.parentNode).toBeNull();
      expect(current.outgoing.className).not.toContain('fade-through-enter');
      expect(current.outgoing.style.transitionDelay).toBe('0ms');
      expect(current.entering.style.transitionDelay).toBe('0ms');
      act(() => endTransition(current.entering));
      expect(current.entering.style.transitionDelay).toBe('');
      expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    } finally {
      view.unmount();
      router.stop();
    }
  });
});
