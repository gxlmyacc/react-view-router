import {
  StandaloneRouteSSRAdapter,
  createStandaloneRouteSSRAdapter,
} from '../src/standalone-route-ssr-adapter';
import {
  NavigationSignalController,
  ROUTE_RUNTIME_PROTOCOL_VERSION,
  RouteRuntimeContext,
} from '../src/route-runtime';

function createContainer(marked = true) {
  return {
    getAttribute: jest.fn((name: string) => {
      if (name === 'data-react-viewprotocol-version') return '1';
      return name === 'data-react-viewssr-route' && marked ? 'true' : null;
    }),
    setAttribute: jest.fn(),
  };
}

function createContext(owner: 'browser' | 'standalone-ssr' | 'framework' = 'standalone-ssr'):
RouteRuntimeContext {
  return {
    descriptor: {
      protocolVersion: ROUTE_RUNTIME_PROTOCOL_VERSION,
      routeId: '0%7C%2Fssr%7Cdefault',
      owner,
    },
    transaction: {
      transactionId: 'tx-ssr',
      action: 'push',
      to: '/ssr',
      signal: new NavigationSignalController().signal,
    },
    component: { type: 'Page' },
  };
}

describe('StandaloneRouteSSRAdapter', () => {
  it('only accepts marked standalone containers', () => {
    const container = createContainer();
    const querySelector = jest.fn(() => container);
    const adapter = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(),
      document: { querySelector },
      priority: 4,
    });

    expect(adapter.priority).toBe(4);
    expect(adapter.canHandle(createContext())).toBe(true);
    expect(querySelector).toHaveBeenCalledWith(
      '[data-react-viewroute-id="0%7C%2Fssr%7Cdefault"]',
    );
    expect(adapter.canHandle(createContext('framework'))).toBe(false);

    const unmarked = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(),
      findContainer: () => createContainer(false),
    });
    expect(unmarked.canHandle(createContext())).toBe(false);

    const wrongProtocolContainer = createContainer();
    wrongProtocolContainer.getAttribute.mockImplementation((name: string) => (
      name === 'data-react-viewssr-route' ? 'true' : '2'
    ));
    const wrongProtocol = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(),
      findContainer: () => wrongProtocolContainer,
    });
    expect(wrongProtocol.canHandle(createContext())).toBe(false);
  });

  it('supports descriptor selectors and escaped generated selectors', () => {
    const querySelector = jest.fn(() => createContainer());
    const adapter = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(),
      document: { querySelector },
    });
    const context = createContext();
    context.descriptor.container = '#ssr-host';
    expect(adapter.canHandle(context)).toBe(true);
    expect(querySelector).toHaveBeenLastCalledWith('#ssr-host');

    context.descriptor.container = undefined;
    context.descriptor.routeId = 'route\\"quoted';
    expect(adapter.canHandle(context)).toBe(true);
    expect(querySelector).toHaveBeenLastCalledWith(
      `[data-react-viewroute-id="route${String.fromCharCode(92, 92, 92)}"quoted"]`,
    );
  });

  it('hydrates once, renders updates and unmounts on deactivate', () => {
    const container = createContainer();
    const root = { render: jest.fn(), unmount: jest.fn() };
    const hydrateRoot = jest.fn(() => root);
    const adapter = new StandaloneRouteSSRAdapter({
      hydrateRoot,
      findContainer: () => container,
    });
    const context = createContext();

    adapter.prepare(context, context.transaction.signal);
    adapter.activate(context);
    adapter.activate(context);
    context.component = { type: 'UpdatedPage' };
    adapter.update(context);

    expect(hydrateRoot).toHaveBeenCalledTimes(1);
    expect(hydrateRoot).toHaveBeenCalledWith(container, { type: 'Page' });
    expect(root.render).toHaveBeenCalledTimes(2);

    adapter.deactivate(context);
    adapter.deactivate(context);
    expect(root.unmount).toHaveBeenCalledTimes(1);
    expect(container.setAttribute).toHaveBeenCalledWith('data-react-viewssr-route', 'consumed');
  });

  it('supports roots and containers without optional update or marker APIs', () => {
    const container = { getAttribute: jest.fn(() => 'true') };
    const root = { unmount: jest.fn() };
    const adapter = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(() => root),
      findContainer: () => container,
    });
    const context = createContext();

    adapter.activate(context);
    adapter.update(context);
    adapter.deactivate(context);

    expect(root.unmount).toHaveBeenCalledTimes(1);
    expect(container.getAttribute).not.toHaveBeenCalled();
  });

  it('ignores cancelled preparation and reports missing containers', () => {
    const adapter = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(),
      findContainer: () => null,
    });
    const context = createContext();
    const controller = new NavigationSignalController();
    controller.cancel('stale');

    expect(() => adapter.prepare(context, controller.signal)).not.toThrow();
    expect(() => adapter.prepare(context, context.transaction.signal))
      .toThrow('SSR route container was not found');
    expect(() => adapter.activate(context)).toThrow('SSR route container was not found');
  });

  it('dispose unmounts all active roots and works without a document', () => {
    const roots = [
      { unmount: jest.fn() },
      { unmount: jest.fn() },
    ];
    const adapter = createStandaloneRouteSSRAdapter({
      hydrateRoot: jest.fn(() => roots.shift() as any),
      findContainer: () => createContainer(),
    });
    const first = createContext();
    const second = createContext();
    second.descriptor.routeId = 'second';
    adapter.activate(first);
    adapter.activate(second);
    const activeRoots = (adapter as any).records.map((record: any) => record.root);

    adapter.dispose();
    adapter.dispose();
    expect(activeRoots[0].unmount).toHaveBeenCalledTimes(1);
    expect(activeRoots[1].unmount).toHaveBeenCalledTimes(1);

    const noDocument = createStandaloneRouteSSRAdapter({ hydrateRoot: jest.fn() });
    expect(noDocument.canHandle(createContext())).toBe(false);
  });
});
