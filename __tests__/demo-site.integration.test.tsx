import React from 'react';
import {
  act, cleanup, fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import ReactViewRouter from '../src';
import { HistoryType } from '../src/history';
import renderUtils from '../dom/src';
import WorkspaceApp from '../demo_react_shared/src/workspace/App';
import workspaceRoutes from '../demo_react_shared/src/workspace/routes';
import basicNavigationRouter from '../demo_react_shared/src/examples/basic-navigation/history';
import {
  collectSiteRouteEntries, siteRouteEntries,
} from '../demo_react_shared/src/workspace/navigation';
import { apiReferenceItems } from '../demo_react_shared/src/workspace/pages/api-reference';
import queryRouter from '../demo_react_shared/src/examples/query-refresh/history';
import indexRedirectRouter from '../demo_react_shared/src/examples/index-redirect/history';
import calculatorRouter from '../demo_react_shared/src/examples/state-calculator/history';
import transitionRouter from '../demo_react_shared/src/examples/route-transition/history';
import keepAliveRouter from '../demo_react_shared/src/examples/keep-alive/history';
import drawerRouter from '../demo_react_shared/src/examples/drawer/history';
import hooksMetaRouter from '../demo_react_shared/src/examples/hooks-meta/history';
import guardNavigationRouter from '../demo_react_shared/src/examples/guard-navigation/history';
import {
  getGuardNavigationEvents,
} from '../demo_react_shared/src/examples/guard-navigation/events';
import {
  externalMemoryHistory, externalMemoryRouter, internalMemoryRouter,
} from '../demo_react_shared/src/examples/memory-routing/history';

describe('React demo documentation site', () => {
  afterEach(() => {
    cleanup();
    basicNavigationRouter.stop();
    queryRouter.stop();
    indexRedirectRouter.stop();
    calculatorRouter.stop();
    internalMemoryRouter.stop();
    externalMemoryRouter.stop();
    transitionRouter.stop();
    keepAliveRouter.stop();
    drawerRouter.stop();
    hooksMetaRouter.stop();
    guardNavigationRouter.stop();
  });

  it('derives ordered menus, tabs, and example descriptions from route meta', () => {
    const collected = collectSiteRouteEntries();

    expect(collected.map(entry => entry.path)).toEqual(siteRouteEntries.map(entry => entry.path));
    expect(collected.map(entry => entry.navigation.order)).toEqual([
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 162, 165, 167, 170, 180,
    ]);
    expect(collected.find(entry => entry.path === '/architecture')).toMatchObject({
      title: 'architecture',
      navigation: { section: 'guides', topNav: true, tab: true },
    });
    expect(collected.find(entry => entry.path === '/route-config')).toMatchObject({
      title: 'routeConfig',
      navigation: { section: 'guides', tab: true },
    });
    expect(collected.find(entry => entry.path === '/features')).toMatchObject({
      title: 'featureIndex',
      navigation: { section: 'guides', tab: true },
    });
    expect(collected.find(entry => entry.path === '/api')).toMatchObject({
      title: 'apiReference',
      navigation: { section: 'guides', topNav: true, tab: true },
    });
    expect(collected.find(entry => entry.path === '/playground')).toMatchObject({
      title: 'playground',
      navigation: { section: 'guides', tab: true },
    });
    expect(collected.find(entry => entry.path === '/home')).toMatchObject({
      title: 'home',
      navigation: { section: 'overview', topNav: true, tab: true, closable: false },
    });
    expect(collected.find(entry => entry.path === '/examples/query-refresh')).toMatchObject({
      title: 'queryRefresh',
      navigation: { section: 'examples', tab: true },
      example: {
        description: 'queryRefreshDescription',
        apis: expect.arrayContaining(['queryProps', 'router.push']),
      },
    });
  });

  it('filters the API index and opens its related runnable route', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/features',
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const view = render(<WorkspaceApp router={router} />);

    await waitFor(() => expect(view.container.querySelectorAll('.api-reference-card')).toHaveLength(22));
    expect(apiReferenceItems.every(item => Boolean(item.examplePath || item.details?.length))).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('Try RouterView, state, guard, memory…'), {
      target: { value: 'KeepAlive' },
    });
    fireEvent.click(screen.getByText('Key behavior'));
    expect(screen.getByText(/useViewActivate and useViewDeactivate/)).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Try RouterView, state, guard, memory…'), {
      target: { value: 'useManualRouter' },
    });
    expect(view.container.querySelectorAll('.api-reference-card')).toHaveLength(1);
    expect(view.container.querySelector('.api-reference-card')?.textContent).toContain('useManualRouter');

    fireEvent.click(screen.getByText('Open runnable example →'));
    await waitFor(() => expect(router.currentRoute?.path).toBe('/architecture'));

    view.unmount();
    router.stop();
  });

  it('renders the API menu from the repository Markdown source in both languages', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        'docs/api.md': {
          en: '# ReactViewRouter API reference\n\n## Router\n\n`push(to)` starts navigation. [SSR](./ssr.md)',
          zh: '# ReactViewRouter API 参考\n\n## Router\n\n`push(to)` 发起导航。 [SSR](./ssr_CN.md)',
        },
        'docs/ssr.md': {
          en: '# SSR guide\n\n## Hydration\n\nServer routes.',
          zh: '# SSR 指南\n\n## 水合\n\n服务端路由。',
        },
      }),
    });
    Object.defineProperty(global, 'fetch', { configurable: true, value: fetchMock });
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/api',
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const view = render(<WorkspaceApp router={router} />);

    await waitFor(() => expect(screen.getByText('ReactViewRouter API reference')).toBeTruthy());
    expect(view.container.querySelector('.markdown-toc')?.textContent).toContain('Router');
    expect(view.container.querySelector('.markdown-preamble')).toBeTruthy();
    expect(view.container.querySelector('.markdown-section')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('reference/api-documents.json'));
    fireEvent.click(screen.getByRole('link', { name: 'SSR' }));
    await waitFor(() => expect(screen.getByText('SSR guide')).toBeTruthy());
    expect(router.currentRoute?.query.document).toBe('docs/ssr.md');
    fireEvent.click(screen.getByText('中文'));
    await waitFor(() => expect(screen.getByText('SSR 指南')).toBeTruthy());

    view.unmount();
    router.stop();
    delete (global as typeof globalThis & { fetch?: typeof fetch }).fetch;
  });

  it('documents index, redirect, nested params, metadata, and lazy route configuration', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/route-config',
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const view = render(<WorkspaceApp router={router} />);

    await waitFor(() => expect(screen.getByText('Route configuration practices')).toBeTruthy());
    expect(view.container.querySelectorAll('.config-reference dt')).toHaveLength(7);
    expect(view.container.textContent).toContain("component: lazyImport(() => import('./pages/User'))");
    expect(view.container.textContent).toContain('queryProps:');
    expect(view.container.textContent).toContain('router.currentRoute.matched');
    expect(view.container.textContent).toContain('Dashboard must render a nested RouterView');

    view.unmount();
    router.stop();
  });

  it('presents copyable quick-start and host/module integration practices', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/quick-start',
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const view = render(<WorkspaceApp router={router} />);

    await waitFor(() => expect(screen.getByText('routes.ts')).toBeTruthy());
    expect(view.container.querySelectorAll('.code-file')).toHaveLength(3);
    expect(view.container.querySelectorAll('.code-file .code-block')).toHaveLength(3);
    expect(view.container.querySelectorAll('.code-token-keyword').length).toBeGreaterThan(0);
    expect(view.container.querySelectorAll('.code-token-string').length).toBeGreaterThan(0);
    expect(view.container.textContent).toContain("router.beforeEach((to, from, next)");

    const architectureButton = Array.from(view.container.querySelectorAll('.site-menu-item'))
      .find(element => element.textContent === 'Host and module integration') as HTMLButtonElement;
    fireEvent.click(architectureButton);
    await waitFor(() => expect(router.currentRoute?.path).toBe('/architecture'));
    expect(view.container.querySelectorAll('.architecture-flow > section')).toHaveLength(3);
    expect(view.container.textContent).toContain('The host route table contains one root entry');
    expect(view.container.textContent).toContain('useManualRouter(router');

    view.unmount();
    router.stop();
  });

  it('shows dynamic route data and lets a module navigate to an absolute host route', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/basic-navigation/users/42',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(basicNavigationRouter.currentRoute?.path).toBe('/users/42'));
    await waitFor(() => expect(view.container.querySelector('.module-preview')?.textContent)
      .toContain('computed:/users/:userId'));
    expect(view.container.querySelector('.module-preview')?.textContent).toContain('Passed directly by the nearest RouterView');

    fireEvent.click(screen.getByText('absolute → host guide'));
    await waitFor(() => expect(workspaceRouter.currentRoute?.path).toBe('/architecture'));
    expect(workspaceRouter.history.location.pathname).toBe('/architecture');

    view.unmount();
    workspaceRouter.stop();
  });

  it('renders site navigation and opens route-meta-backed tabs', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/home',
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const view = render(<WorkspaceApp router={router} />);

    await waitFor(() => expect(screen.getByText('One route layer for applications and integrated modules')).toBeTruthy());
    expect(document.head.querySelector('link[data-react-view-router-site-icon="true"]'))
      .toHaveAttribute('href', expect.stringContaining('test-file-stub'));
    const quickStartButton = Array.from(view.container.querySelectorAll('.site-menu-item'))
      .find(element => element.textContent === 'Quick Start') as HTMLButtonElement;
    fireEvent.click(quickStartButton);
    await waitFor(() => expect(router.currentRoute?.path).toBe('/quick-start'));
    expect(view.container.querySelector('.route-tabs')?.textContent).toContain('Home');
    await waitFor(() => expect(view.container.querySelector('.route-tabs')?.textContent).toContain('Quick Start'));

    view.unmount();
    router.stop();
  });

  it('refreshes the same unauthorized page when a declared query prop changes', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/query-refresh/unauthorized?module=finance',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(queryRouter.currentRoute?.query.module).toBe('finance'));
    await waitFor(() => expect(view.container.querySelector('.permission-card dd')?.textContent).toBe('Finance'));
    const initialCard = view.container.querySelector('.permission-card');

    await act(async () => {
      fireEvent.click(screen.getByText('HR denied'));
    });
    await waitFor(() => expect(queryRouter.currentRoute?.fullPath).toBe('/unauthorized?module=hr'));
    await waitFor(() => expect(view.container.querySelector('.permission-card dd')?.textContent).toBe('Human resources'));
    expect(view.container.querySelector('.permission-card')).toBe(initialCard);
    expect(view.container.querySelector('.permission-card dd:last-child')?.textContent).toBe('2');
    expect(workspaceRouter.history.location.pathname).toBe('/examples/query-refresh/unauthorized');

    view.unmount();
    workspaceRouter.stop();
  });

  it('demonstrates that index preserves the root URL while redirect changes it', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/index-redirect',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(screen.getByText('Overview page')).toBeTruthy());
    expect(workspaceRouter.history.location.pathname).toBe('/examples/index-redirect');
    expect(indexRedirectRouter.currentRoute?.path).toBe('/overview');
    expect(indexRedirectRouter.currentRoute?.matched.map(item => item.path)).toContain('/overview');
    expect(view.container.querySelector('.route-facts dd:last-child')?.textContent).toContain('/overview');

    fireEvent.click(screen.getByText('Open legacy redirect'));
    await waitFor(() => expect(indexRedirectRouter.currentRoute?.path).toBe('/replacement'));
    expect(workspaceRouter.history.location.pathname).toBe('/examples/index-redirect/replacement');

    view.unmount();
    workspaceRouter.stop();
  });

  it('keeps calculator state on its target entry and restores it after back', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/state-calculator',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(screen.getByText('Calculate and open result')).toBeTruthy());
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '9' } });
    fireEvent.click(screen.getByText('Calculate and open result'));
    await waitFor(() => expect(calculatorRouter.currentRoute?.path).toBe('/result'));
    await waitFor(() => expect(calculatorRouter.currentRoute?.state)
      .toMatchObject({ expression: '8 + 9', result: 17 }));
    expect(screen.getByText('17')).toBeTruthy();

    fireEvent.click(screen.getByText('Open help page'));
    await waitFor(() => expect(calculatorRouter.currentRoute?.path).toBe('/help'));
    fireEvent.click(screen.getByText('Back to result'));
    await waitFor(() => expect(calculatorRouter.currentRoute?.path).toBe('/result'));
    expect(calculatorRouter.currentRoute?.state).toMatchObject({ result: 17 });
    expect(screen.getByText('8 + 9')).toBeTruthy();

    view.unmount();
    workspaceRouter.stop();
  });

  it('preserves a KeepAlive draft and emits activate/deactivate without remounting it', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/keep-alive/draft',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    const draft = await screen.findByLabelText('Draft text') as HTMLTextAreaElement;
    fireEvent.change(draft, { target: { value: 'Retain this draft' } });
    await waitFor(() => expect(screen.getByText('17')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Open preview' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/preview'));
    await waitFor(() => expect(view.container.querySelector('.keep-alive-log')?.textContent).toContain('Draft deactivated'));

    fireEvent.click(screen.getByRole('button', { name: 'Open cached draft' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/draft'));
    await waitFor(() => expect(screen.getByLabelText('Draft text')).toHaveValue('Retain this draft'));
    expect(view.container.querySelectorAll('.keep-alive-log li')).toHaveLength(3);
    expect(view.container.querySelector('.keep-alive-log')?.textContent).toContain('Draft activated');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Animate page changes' }));
    expect(screen.getByLabelText('Draft text')).toHaveValue('Retain this draft');
    fireEvent.click(screen.getByRole('button', { name: 'Open preview' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/preview'));
    await waitFor(() => expect(document.querySelector('[aria-hidden="true"] .keep-alive-draft-page')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Open cached draft' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/draft'));
    await waitFor(() => expect(screen.getByLabelText('Draft text')).toHaveValue('Retain this draft'));
    expect(screen.getByText('17')).toBeTruthy();
    await waitFor(() => expect(view.container.querySelectorAll('.keep-alive-log li')).toHaveLength(5));

    fireEvent.click(screen.getByRole('button', { name: 'Open preview' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/preview'));
    fireEvent.click(screen.getByRole('button', { name: 'Return' }));
    await waitFor(() => expect(keepAliveRouter.currentRoute?.path).toBe('/draft'));

    view.unmount();
    workspaceRouter.stop();
  });

  it('opens and closes a nested route through RouterDrawer', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/drawer/home',
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    expect(await screen.findByRole('button', { name: 'Open details drawer' })).toBeTruthy();
    const log = within(screen.getByRole('complementary', { name: 'Parent page lifecycle' }));
    expect(log.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'componentDidMount — parent mounted',
    ]);
    fireEvent.change(screen.getByLabelText('Parent page note'), { target: { value: 'still mounted' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open details drawer' }));
    await waitFor(() => expect(drawerRouter.currentRoute?.path).toBe('/home/details'));
    expect(await screen.findByText('Details route')).toBeTruthy();
    expect(document.querySelector('.rvr-route-drawer')).toBeTruthy();
    expect(view.container.querySelector(
      '.drawer-home-page > .rvr-route-drawer-mask-inline .rvr-route-drawer',
    )).toBeTruthy();
    expect(view.container.querySelector('.drawer-viewport')).toBeNull();
    expect(log.getByText('componentWillUnactivate — parent inactive')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close details drawer' }));
    await waitFor(() => expect(drawerRouter.currentRoute?.path).toBe('/home'));
    await waitFor(() => expect(document.querySelector('.rvr-route-drawer')).toBeNull());
    expect(screen.getByLabelText('Parent page note')).toHaveValue('still mounted');
    expect(log.getByText('componentDidActivate — parent active again')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open details drawer' }));
    await screen.findByRole('button', { name: 'Close details drawer' });
    fireEvent.click(screen.getByRole('button', { name: 'Close details drawer' }));
    await waitFor(() => expect(document.querySelector('.rvr-route-drawer')).toBeNull());
    expect(screen.getByLabelText('Parent page note')).toHaveValue('still mounted');
    expect(log.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'componentDidMount — parent mounted',
      'useViewDeactivate — parent inactive',
      'componentWillUnactivate — parent inactive',
      'componentDidActivate — parent active again',
      'useViewActivate — parent active again',
      'useViewDeactivate — parent inactive',
      'componentWillUnactivate — parent inactive',
      'componentDidActivate — parent active again',
      'useViewActivate — parent active again',
    ]);
    view.unmount();
    workspaceRouter.stop();
  });

  it('keeps owned and externally supplied memory histories independent from the workspace URL', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/memory-routing',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(screen.getByText('Router-owned history')).toBeTruthy());
    await waitFor(() => expect(externalMemoryRouter.history).toBe(externalMemoryHistory));
    expect(workspaceRouter.history.location.pathname).toBe('/examples/memory-routing');

    const panels = view.container.querySelectorAll('.memory-routing-example > article');
    fireEvent.click(Array.from(panels[0].querySelectorAll('button'))
      .find(button => button.textContent === 'Memory details') as HTMLButtonElement);
    await waitFor(() => expect(internalMemoryRouter.currentRoute?.path).toBe('/details'));
    expect(externalMemoryRouter.currentRoute?.path).toBe('/home');

    fireEvent.click(screen.getByText('history.push details'));
    await waitFor(() => expect(externalMemoryRouter.currentRoute?.path).toBe('/details'));
    expect(internalMemoryRouter.currentRoute?.path).toBe('/details');
    expect(workspaceRouter.history.location.pathname).toBe('/examples/memory-routing');

    view.unmount();
    workspaceRouter.stop();
  });

  it('shows that guard navigation handles the decision while a later outer next is ignored', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/guard-navigation/home',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(screen.getByText('Guard navigation home')).toBeTruthy());
    fireEvent.click(screen.getByText('same target → resolve + callback'));
    await waitFor(() => expect(guardNavigationRouter.currentRoute?.path).toBe('/same-target'));
    await waitFor(() => expect(getGuardNavigationEvents()).toContainEqual(expect.objectContaining({
      to: '/same-target',
      hook: 'router.replace.promise',
      outcome: 'resolved',
    })));
    expect(getGuardNavigationEvents()).toContainEqual(expect.objectContaining({
      to: '/same-target',
      hook: 'next(callback)',
      outcome: 'complete',
    }));

    fireEvent.click(screen.getByText('/parent → /parent/child'));
    await waitFor(() => expect(guardNavigationRouter.currentRoute?.path).toBe('/parent/child'));
    await waitFor(() => expect(view.container.querySelector('.guard-navigation-promise')?.textContent)
      .toContain('RESOLVED'));

    fireEvent.click(screen.getByText('same pathname, change query'));
    await waitFor(() => expect(guardNavigationRouter.currentRoute?.fullPath)
      .toBe('/query-target?version=2'));
    await waitFor(() => expect(getGuardNavigationEvents()).toContainEqual(expect.objectContaining({
      to: '/query-target?version=1',
      hook: 'router.replace.promise',
      outcome: 'resolved',
    })));
    expect(getGuardNavigationEvents()).not.toContainEqual(expect.objectContaining({
      to: '/query-target?version=1',
      hook: 'next(callback)',
    }));

    fireEvent.click(screen.getByText('different target → redirect'));
    await waitFor(() => expect(guardNavigationRouter.currentRoute?.path).toBe('/login'));

    const events = getGuardNavigationEvents();
    const takeover = events.find(event => event.hook === 'authInterceptor');
    expect(takeover).toMatchObject({ to: '/global-replace', outcome: 'takeover' });
    expect(events).toContainEqual(expect.objectContaining({
      id: takeover?.id,
      hook: 'router.beforeEach.next',
      outcome: 'ignored',
    }));
    expect(events).not.toContainEqual(expect.objectContaining({
      to: '/global-replace',
      hook: 'router.afterEach',
    }));
    expect(events).toContainEqual(expect.objectContaining({
      to: '/login',
      hook: 'router.afterEach',
      outcome: 'complete',
    }));
    await waitFor(() => expect(getGuardNavigationEvents()).toContainEqual(expect.objectContaining({
      to: '/global-replace',
      hook: 'router.replace.promise',
      outcome: 'resolved',
    })));

    fireEvent.click(screen.getByText('beforeRouteEnter → push'));
    await waitFor(() => expect(guardNavigationRouter.currentRoute?.path).toBe('/push-target'));
    const pushEvents = getGuardNavigationEvents();
    const componentTakeover = pushEvents.find(event => (
      event.hook === 'component.beforeRouteEnter' && event.to === '/component-push'
    ));
    expect(componentTakeover).toMatchObject({ outcome: 'takeover' });
    expect(pushEvents).toContainEqual(expect.objectContaining({
      id: componentTakeover?.id,
      hook: 'component.beforeRouteEnter.next',
      outcome: 'ignored',
    }));
    expect(pushEvents).not.toContainEqual(expect.objectContaining({
      to: '/component-push',
      hook: 'router.afterEach',
    }));

    fireEvent.click(screen.getByText('beforeEnter → next(false)'));
    await waitFor(() => expect(getGuardNavigationEvents()).toContainEqual(expect.objectContaining({
      to: '/blocked',
      outcome: 'abort',
    })));
    expect(guardNavigationRouter.currentRoute?.path).toBe('/push-target');
    expect(getGuardNavigationEvents()).not.toContainEqual(expect.objectContaining({
      to: '/blocked',
      hook: 'router.afterEach',
    }));

    view.unmount();
    workspaceRouter.stop();
  });

  it('runs the transition RouterView with a module-owned manual router', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/route-transition',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(screen.getByText('First page')).toBeTruthy());
    fireEvent.click(screen.getByText('none'));
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(transitionRouter.currentRoute?.path).toBe('/second'));
    await waitFor(() => expect(screen.getByText('Second page')).toBeTruthy());
    expect(workspaceRouter.history.location.pathname)
      .toBe('/examples/route-transition/second');

    fireEvent.click(screen.getByText('fade'));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '900' } });
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(transitionRouter.currentRoute?.path).toBe('/third'));
    expect((document.querySelector('.react-view-router-fade-enter') as HTMLElement).style.transitionDuration)
      .toBe('900ms');

    view.unmount();
    workspaceRouter.stop();
  });

  it('builds hook reference navigation from route metadata and keeps a runnable inspector', async () => {
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/hooks-meta',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(hooksMetaRouter.currentRoute?.fullPath)
      .toBe('/navigation/use-route-title'));
    await waitFor(() => expect(screen.getByText('Builds menu, tab and breadcrumb models from route metadata and the current matched chain.')).toBeTruthy());
    expect(view.container.querySelector('.hook-reference-page .code-block')?.textContent)
      .toBe('useRouteTitle(props?, defaultRouter?, deps?)');
    expect(screen.getByText('props.maxLevel')).toBeTruthy();
    expect(screen.getByText('props.filterMetas')).toBeTruthy();
    expect(screen.getByText('props.onNoMatchedPath')).toBeTruthy();
    expect(view.container.querySelector('.hook-reference-page .code-block')?.getAttribute('data-language'))
      .toBe('ts');
    expect(view.container.querySelectorAll('.hooks-route-menu li.is-open')).toHaveLength(1);
    expect(view.container.querySelectorAll('.hooks-route-tabs button')).toHaveLength(5);
    expect(view.container.querySelectorAll('.hooks-route-menu button.is-active')).toHaveLength(1);
    expect(view.container.querySelector('.hooks-route-menu button.is-active')?.textContent)
      .toBe('useRouteTitle');
    expect(view.container.querySelector('.hooks-route-tabs .is-active')?.textContent).toBe('useRouteTitle');
    expect(view.container.querySelector('.hooks-breadcrumb')?.textContent)
      .toBe('Navigation models / useRouteTitle');
    expect(view.container.querySelector('.hooks-title-runtime code:last-child')?.textContent)
      .toBe('/navigation/use-route-title');

    const dataMenuButton = screen.getByText('Route data') as HTMLButtonElement;
    fireEvent.click(dataMenuButton);
    expect(dataMenuButton.getAttribute('aria-expanded')).toBe('true');
    const routeParamsMenuButton = Array.from(view.container.querySelectorAll('.hooks-route-menu button'))
      .find(element => element.textContent === 'useRouteParams') as HTMLButtonElement;
    fireEvent.click(routeParamsMenuButton);
    await waitFor(() => expect(hooksMetaRouter.currentRoute?.path).toBe('/data/use-route-params'));
    expect(screen.getByText('Reads dynamic path parameters from the matched route.')).toBeTruthy();
    expect(view.container.querySelector('.hook-reference-page .code-block')?.textContent)
      .toBe('useRouteParams(defaultRouter?, options?)');
    expect(view.container.querySelector('.hooks-route-menu button.is-active')?.textContent)
      .toBe('useRouteParams');

    const liveMenuButton = screen.getByText('Live examples') as HTMLButtonElement;
    fireEvent.click(liveMenuButton);
    const inspectorMenuButton = Array.from(view.container.querySelectorAll('.hooks-route-menu button'))
      .find(element => element.textContent === 'Hooks inspector') as HTMLButtonElement;
    fireEvent.click(inspectorMenuButton);
    await waitFor(() => expect(hooksMetaRouter.currentRoute?.fullPath)
      .toBe('/live/inspector/monthly?view=summary'));
    await waitFor(() => expect(screen.getByText('/live/inspector/monthly?view=summary')).toBeTruthy());
    expect(screen.getByText('live:monthly:summary')).toBeTruthy();

    fireEvent.click(screen.getByText('HR details'));
    await waitFor(() => expect(hooksMetaRouter.currentRoute?.path).toBe('/live/inspector/employees'));
    await waitFor(() => expect(screen.getByText('live:employees:details')).toBeTruthy());
    expect(hooksMetaRouter.currentRoute?.state).toMatchObject({ note: 'hr/details' });
    expect(view.container.querySelector('.hooks-breadcrumb')?.textContent)
      .toBe('Live examples / Hooks inspector');

    fireEvent.click(screen.getByText('Toggle route meta'));
    await waitFor(() => expect(screen.getByText('analyst / reviewing')).toBeTruthy());

    view.unmount();
    workspaceRouter.stop();
  });
});
