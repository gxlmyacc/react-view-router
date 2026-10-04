import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReactViewRouter, { RouterView, HistoryType } from '../src';
import renderUtils from '../dom/src';
import App from '../demo_react_shared/src/examples/save-position/App';
import moduleRouter from '../demo_react_shared/src/examples/save-position/history';
import routes from '../demo_react_shared/src/examples/save-position/routes';

describe('savePosition runnable example', () => {
  afterEach(() => {
    cleanup();
    moduleRouter.stop();
    moduleRouter.updateRouteMeta(routes[1], { savePosition: '.save-position-scroll' });
    sessionStorage.clear();
  });

  it.each([false, true])('restores the remounted list with Transition=%s and demonstrates disabling saving', async (animate) => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/save-position/list',
      renderUtils,
      routes: [{
        path: '/examples/save-position',
        component: App,
        defaultProps: { basename: '/examples/save-position', mode: HistoryType.memory }
      }],
    });
    router.start();
    const view = render(<React.StrictMode><RouterView router={router} /></React.StrictMode>);
    try {
      await screen.findByTestId('position-list');
      if (animate) fireEvent.click(screen.getByLabelText('Use Transition'));
      const oldList = await screen.findByTestId('position-list');
      oldList.scrollTop = 240;
      fireEvent.scroll(oldList);
      expect(screen.getByTestId('position-offset').textContent).toBe('240 px');
      fireEvent.click(screen.getByText('Open preview'));
      await screen.findByTestId('position-preview');
      fireEvent.click(screen.getByText('Return to list'));
      await waitFor(() => expect(screen.getByTestId('position-list').scrollTop).toBe(240));
      expect(screen.getByTestId('position-list')).not.toBe(oldList);
      fireEvent.click(screen.getByLabelText('Save position'));
      const list = screen.getByTestId('position-list');
      list.scrollTop = 480;
      fireEvent.scroll(list);
      fireEvent.click(screen.getByText('Open preview'));
      await screen.findByTestId('position-preview');
      fireEvent.click(screen.getByText('Return to list'));
      await screen.findByTestId('position-list');
      expect(screen.getByTestId('position-list').scrollTop).toBe(0);
    } finally { view.unmount(); router.stop(); }
  });
});
