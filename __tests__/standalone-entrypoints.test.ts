import ReactDOM from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import {
  ROUTE_RUNTIME_PROTOCOL_VERSION,
  RouteRuntimeContext,
} from '../src/route-runtime';
import { createLegacyStandaloneRouteSSRAdapter } from '../src/standalone-legacy';
import { createModernStandaloneRouteSSRAdapter } from '../src/standalone-modern';

jest.mock('react-dom', () => ({
  __esModule: true,
  default: {
    hydrate: jest.fn(),
    render: jest.fn(),
    unmountComponentAtNode: jest.fn(),
  },
}));

jest.mock('react-dom/client', () => ({
  hydrateRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

const mockLegacyHydrate = ReactDOM.hydrate as jest.Mock;
const mockLegacyRender = ReactDOM.render as jest.Mock;
const mockLegacyUnmount = ReactDOM.unmountComponentAtNode as jest.Mock;
const mockModernHydrateRoot = hydrateRoot as jest.Mock;

function createContainer() {
  return {
    getAttribute(name: string) {
      if (name === 'data-react-viewssr-route') return 'true';
      if (name === 'data-react-viewprotocol-version') return '1';
      return null;
    },
    setAttribute: jest.fn(),
  };
}

function createContext(): RouteRuntimeContext {
  return {
    descriptor: {
      protocolVersion: ROUTE_RUNTIME_PROTOCOL_VERSION,
      routeId: 'legacy-modern-contract',
      owner: 'standalone-ssr',
    },
    transaction: {
      transactionId: 'entrypoint-test',
      action: 'push',
      to: '/ssr',
      signal: { cancelled: false, onCancel: () => () => undefined },
    },
    component: { type: 'InitialPage' },
  };
}

describe('standalone React-version entrypoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('legacy entrypoint only delegates to ReactDOM.hydrate/render/unmount', () => {
    const container = createContainer();
    const adapter = createLegacyStandaloneRouteSSRAdapter({
      findContainer: () => container,
    });
    const context = createContext();

    adapter.activate(context);
    context.component = { type: 'UpdatedPage' };
    adapter.update(context);
    adapter.deactivate(context);

    expect(mockLegacyHydrate).toHaveBeenCalledWith({ type: 'InitialPage' }, container);
    expect(mockLegacyRender).toHaveBeenCalledWith({ type: 'UpdatedPage' }, container);
    expect(mockLegacyUnmount).toHaveBeenCalledWith(container);
    expect(mockModernHydrateRoot).not.toHaveBeenCalled();
  });

  it('modern entrypoint only delegates to react-dom/client hydrateRoot', () => {
    const container = createContainer();
    const adapter = createModernStandaloneRouteSSRAdapter({
      findContainer: () => container,
    });
    const context = createContext();

    adapter.activate(context);
    context.component = { type: 'UpdatedPage' };
    adapter.update(context);
    adapter.deactivate(context);

    expect(mockModernHydrateRoot).toHaveBeenCalledWith(container, { type: 'InitialPage' });
    const modernRoot = mockModernHydrateRoot.mock.results[0].value;
    expect(modernRoot.render).toHaveBeenCalledWith({ type: 'UpdatedPage' });
    expect(modernRoot.unmount).toHaveBeenCalledTimes(1);
    expect(mockLegacyHydrate).not.toHaveBeenCalled();
  });

  it('both entrypoints support their documented zero-config factory defaults', () => {
    expect(createLegacyStandaloneRouteSSRAdapter()).toMatchObject({
      name: 'standalone-ssr',
      owner: 'standalone-ssr',
    });
    expect(createModernStandaloneRouteSSRAdapter()).toMatchObject({
      name: 'standalone-ssr',
      owner: 'standalone-ssr',
    });
  });
});
