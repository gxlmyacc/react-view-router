import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import createRouterLink, { RouterLink, guardEvent } from '../src/router-link';
import { RouterContext } from '../src/context';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from './helpers/test-utils';

describe('RouterLink 集成测试', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('应渲染链接并显示 href', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');

    renderWithRouter(
      React.createElement(RouterLink, { to: '/about', tag: 'a' }, '去关于'),
      router,
    );

    await screen.findByText('去关于');
    const link = screen.getByText('去关于');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/about');
    router.stop();
  });

  it('点击应触发 router.push', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        router,
      }, '跳转'),
      router,
    );

    fireEvent.click(await screen.findByText('跳转'));
    expect(pushSpy).toHaveBeenCalled();
    router.stop();
  });

  it('replace 为 true 时应调用 router.replace', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const replaceSpy = jest.spyOn(router, 'replace');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        replace: true,
        router,
      }, '替换'),
      router,
    );

    fireEvent.click(await screen.findByText('替换'));
    expect(replaceSpy).toHaveBeenCalled();
    router.stop();
  });

  it('匹配路由时应添加 activeClass', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        activeClass: 'is-active',
        router,
      }, '关于'),
      router,
    );

    const link = await screen.findByText('关于');
    await waitFor(() => {
      expect(link.className).toContain('is-active');
    });
    router.stop();
  });

  it('disabled 时不应触发导航', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        disabled: true,
      }, '禁用'),
      router,
    );

    fireEvent.click(await screen.findByText('禁用'));
    expect(pushSpy).not.toHaveBeenCalled();
    router.stop();
  });

  it('tag 为空时应只渲染 children', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');

    renderWithRouter(
      React.createElement(RouterLink, { to: '/about', tag: '' }, '纯文本'),
      router,
    );

    expect(await screen.findByText('纯文本')).toBeTruthy();
    router.stop();
  });

  it('createRouterLink 应注入 router', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const BoundLink = createRouterLink(router);

    render(React.createElement(BoundLink, { to: '/about', tag: 'a' }, '绑定'));

    expect(await screen.findByText('绑定')).toBeTruthy();
    router.stop();
  });

  it('onRouteChange 应在路由变化时触发', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const onRouteChange = jest.fn();

    const { rerender } = renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        onRouteChange,
      }, '监听'),
      router,
    );

    await screen.findByText('监听');
    syncNavigate(router, '/about');
    rerender(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(RouterLink, {
          to: '/about',
          tag: 'a',
          onRouteChange,
        }, '监听'),
      ),
    );
    router.stop();
  });

  it('exact 匹配时应使用 exactActiveClass', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        exact: true,
        exactActiveClass: 'is-exact',
        router,
      }, '精确'),
      router,
    );

    const link = await screen.findByText('精确');
    await waitFor(() => expect(link.className).toContain('is-exact'));
    router.stop();
  });

  it('router linkActiveClass 应合并到 activeClass', async () => {
    const router = createTestRouter();
    router.linkActiveClass = 'global-active';
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        activeClass: 'local',
        router,
      }, '全局'),
      router,
    );

    const link = await screen.findByText('全局');
    await waitFor(() => {
      expect(link.className).toContain('global-active');
      expect(link.className).toContain('local');
    });
    router.stop();
  });

  it('onRouteInactive 应在离开匹配路由时触发', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const onRouteInactive = jest.fn();

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        onRouteInactive,
        router,
      }, '离开'),
      router,
    );

    await screen.findByText('离开');
    syncNavigate(router, '/');
    await waitFor(() => expect(onRouteInactive).toHaveBeenCalled());
    router.stop();
  });

  it('自定义 event 应触发导航', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'button',
        event: 'click',
        router,
      }, '按钮'),
      router,
    );

    fireEvent.click(await screen.findByText('按钮'));
    expect(pushSpy).toHaveBeenCalled();
    router.stop();
  });

  it('事件回调返回 false 时取消导航并跳过空事件项', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');
    const onClick = jest.fn(() => false);

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'button',
        event: ['', 'click'],
        onClick,
        router,
      }, '可取消'),
      router,
    );

    fireEvent.click(await screen.findByText('可取消'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(pushSpy).not.toHaveBeenCalled();
    router.stop();
  });

  it('无 children 时可渲染空链接', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');

    const { container } = renderWithRouter(
      React.createElement(RouterLink, { to: '/about', tag: 'a', router }),
      router,
    );

    await waitFor(() => expect(container.querySelector('a')).toBeTruthy());
    expect(container.querySelector('a')?.textContent).toBe('');
    router.stop();
  });

  it('活动类名会与调用方 className 合并', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        activeClass: 'active-link',
        className: 'custom-link',
        router,
      }, '合并类名'),
      router,
    );

    const link = await screen.findByText('合并类名');
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['active-link', 'custom-link']));
    router.stop();
  });

  it('全局活动类名可作为空局部类名的回退', async () => {
    const router = createTestRouter();
    router.linkActiveClass = 'global-active';
    router.linkExactActiveClass = 'global-exact';
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(RouterLink, {
          to: '/about',
          tag: 'a',
          activeClass: '',
          router,
        }, '全局活动回退'),
        React.createElement(RouterLink, {
          to: '/about',
          tag: 'a',
          exact: true,
          exactActiveClass: '',
          router,
        }, '全局精确回退'),
      ),
      router,
    );

    expect(await screen.findByText('全局活动回退')).toHaveClass('global-active');
    expect(await screen.findByText('全局精确回退')).toHaveClass('global-exact');
    router.stop();
  });

  it('支持 onClick 事件名并暴露匹配状态检查', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const onClick = jest.fn(() => false);
    const linkRef = React.createRef<RouterLink>();

    renderWithRouter(
      React.createElement(RouterLink, {
        ref: linkRef,
        to: '/about',
        tag: 'button',
        event: 'onClick',
        onClick,
        router,
      }, '事件名'),
      router,
    );

    fireEvent.click(await screen.findByText('事件名'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(linkRef.current!.isMatched()).toBe(true);
    expect(linkRef.current!.shouldComponentUpdate(linkRef.current!.props, linkRef.current!.state)).toBe(false);
    router.stop();
  });

  it('挂载时已匹配应触发 onRouteActive', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const onRouteActive = jest.fn();
    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        onRouteActive,
        router,
      }, '已激活'),
      router,
    );
    await waitFor(() => expect(onRouteActive).toHaveBeenCalled());
    router.stop();
  });

  it('linkExactActiveClass 全局类应合并', async () => {
    const router = createTestRouter();
    router.linkExactActiveClass = 'global-exact';
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        exact: true,
        router,
      }, '精确全局'),
      router,
    );

    const link = await screen.findByText('精确全局');
    await waitFor(() => expect(link.className).toContain('global-exact'));
    router.stop();
  });

  it('onRouteActive 路由匹配变化应触发', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const onRouteActive = jest.fn();
    const onRouteInactive = jest.fn();

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        onRouteActive,
        onRouteInactive,
        router,
      }, '切换激活'),
      router,
    );

    await screen.findByText('切换激活');
    syncNavigate(router, '/about');
    await waitFor(() => expect(onRouteActive).toHaveBeenCalled());
    router.stop();
  });

  it('props.router 变更应重新挂载', async () => {
    const router1 = createTestRouter();
    const router2 = createTestRouter();
    syncNavigate(router1, '/');
    syncNavigate(router2, '/');

    const { rerender } = renderWithRouter(
      React.createElement(RouterLink, { to: '/about', tag: 'a', router: router1 }, '切换'),
      router1,
    );
    await screen.findByText('切换');
    rerender(
      React.createElement(
        RouterContext.Provider,
        { value: router2 },
        React.createElement(RouterLink, { to: '/about', tag: 'a', router: router2 }, '切换'),
      ),
    );
    router1.stop();
    router2.stop();
  });

  it('to 对象 query 变化应 remount', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const remountSpy = jest.spyOn(RouterLink.prototype as any, '_remount');
    const { rerender } = renderWithRouter(
      React.createElement(RouterLink, {
        to: { path: '/about', query: { tab: '1' } },
        tag: 'a',
        router,
      }, 'query'),
      router,
    );
    await waitFor(() => expect(remountSpy).toHaveBeenCalled());
    remountSpy.mockClear();
    rerender(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(RouterLink, {
          to: { path: '/about', query: { tab: '2' } },
          tag: 'a',
          router,
        }, 'query'),
      ),
    );
    expect(remountSpy).toHaveBeenCalled();
    router.stop();
  });

  it('Ctrl+点击不应触发 router.push', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        router,
      }, '新标签'),
      router,
    );

    const link = await screen.findByText('新标签');
    fireEvent.click(link, { ctrlKey: true });
    expect(pushSpy).not.toHaveBeenCalled();
    router.stop();
  });

  it('target="_blank" 时不应触发 router.push', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const pushSpy = jest.spyOn(router, 'push');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        target: '_blank',
        router,
      }, '外链'),
      router,
    );

    fireEvent.click(await screen.findByText('外链'));
    expect(pushSpy).not.toHaveBeenCalled();
    router.stop();
  });

  it('前缀路径不应误匹配更长路由', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true },
      { path: '/about', component: About },
      { path: '/about-us', component: About },
    ]);
    syncNavigate(router, '/about-us');

    renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        activeClass: 'is-active',
        router,
      }, '关于'),
      router,
    );

    const link = await screen.findByText('关于');
    await waitFor(() => {
      expect(link.className).not.toContain('is-active');
    });
    router.stop();
  });

  it('to 变更应重新计算 active 状态', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const onRouteInactive = jest.fn();

    const { rerender } = renderWithRouter(
      React.createElement(RouterLink, {
        to: '/about',
        tag: 'a',
        activeClass: 'is-active',
        onRouteInactive,
        router,
      }, '链接'),
      router,
    );

    const link = await screen.findByText('链接');
    await waitFor(() => expect(link.className).toContain('is-active'));

    rerender(
      React.createElement(
        RouterContext.Provider,
        { value: router },
        React.createElement(RouterLink, {
          to: '/users/1',
          tag: 'a',
          activeClass: 'is-active',
          onRouteInactive,
          router,
        }, '链接'),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText('链接').className).not.toContain('is-active');
    });
    router.stop();
  });
});

describe('guardEvent 补充', () => {
  const baseEvent = () => ({
    metaKey: false,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    defaultPrevented: false,
    button: 0,
    preventDefault: jest.fn(),
    currentTarget: { getAttribute: () => null },
  });

  it('普通点击应返回 true', () => {
    const e = baseEvent();
    expect(guardEvent(e)).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });
});
