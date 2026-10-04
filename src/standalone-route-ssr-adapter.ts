import type {
  NavigationSignal,
  RouteRuntimeAdapter,
  RouteRuntimeContext,
  RouteRuntimeDescriptor,
} from './route-runtime';

export interface StandaloneHydrationRoot {
  render?(element: any): void;
  unmount(): void;
}

export type StandaloneHydrateRoot = (
  container: any,
  element: any,
) => StandaloneHydrationRoot;

export interface StandaloneRouteSSRAdapterOptions {
  hydrateRoot: StandaloneHydrateRoot;
  document?: {
    querySelector(selector: string): any;
  };
  findContainer?: (descriptor: RouteRuntimeDescriptor) => any;
  priority?: number;
}

interface HydratedRouteRecord {
  routeId: string;
  container: any;
  root: StandaloneHydrationRoot;
}

function releaseRecord(record: HydratedRouteRecord) {
  record.root.unmount();
  if (record.container.setAttribute) {
    record.container.setAttribute('data-react-viewssr-route', 'consumed');
  }
}

function escapeAttributeValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * React-version-neutral standalone adapter. The modern entry injects
 * react-dom/client's hydrateRoot; a legacy entry can inject ReactDOM.hydrate
 * without making the core package resolve either API.
 */
export class StandaloneRouteSSRAdapter implements RouteRuntimeAdapter {

  readonly name = 'standalone-ssr';

  readonly owner = 'standalone-ssr' as const;

  readonly priority: number;

  private options: StandaloneRouteSSRAdapterOptions;

  private records: HydratedRouteRecord[] = [];

  constructor(options: StandaloneRouteSSRAdapterOptions) {
    this.options = options;
    this.priority = options.priority || 0;
  }

  private findContainer(descriptor: RouteRuntimeDescriptor) {
    if (this.options.findContainer) return this.options.findContainer(descriptor);
    const doc = this.options.document;
    if (!doc) return null;
    if (descriptor.container) return doc.querySelector(descriptor.container);
    const routeId = escapeAttributeValue(descriptor.routeId);
    return doc.querySelector(`[data-react-viewroute-id="${routeId}"]`);
  }

  private findRecord(routeId: string) {
    for (let index = 0; index < this.records.length; index += 1) {
      if (this.records[index].routeId === routeId) return this.records[index];
    }
    return null;
  }

  canHandle(context: RouteRuntimeContext) {
    if (context.descriptor.owner !== this.owner) return false;
    const container = this.findContainer(context.descriptor);
    return Boolean(
      container
      && container.getAttribute
      && container.getAttribute('data-react-viewssr-route') === 'true'
      && container.getAttribute('data-react-viewprotocol-version') === String(context.descriptor.protocolVersion),
    );
  }

  prepare(context: RouteRuntimeContext, signal: NavigationSignal) {
    if (signal.cancelled) return;
    const container = this.findContainer(context.descriptor);
    if (!container) throw new Error(`SSR route container was not found: ${context.descriptor.routeId}`);
  }

  activate(context: RouteRuntimeContext) {
    const routeId = context.descriptor.routeId;
    const current = this.findRecord(routeId);
    if (current) {
      current.root.render && current.root.render(context.component);
      return;
    }

    const container = this.findContainer(context.descriptor);
    if (!container) throw new Error(`SSR route container was not found: ${routeId}`);
    const root = this.options.hydrateRoot(container, context.component);
    this.records.push({ routeId, container, root });
  }

  update(context: RouteRuntimeContext) {
    const current = this.findRecord(context.descriptor.routeId);
    if (current && current.root.render) current.root.render(context.component);
  }

  deactivate(context: RouteRuntimeContext) {
    const routeId = context.descriptor.routeId;
    const current = this.findRecord(routeId);
    if (!current) return;
    releaseRecord(current);
    const index = this.records.indexOf(current);
    if (index >= 0) this.records.splice(index, 1);
  }

  dispose() {
    const records = this.records.slice();
    this.records.length = 0;
    records.forEach(releaseRecord);
  }

}

export function createStandaloneRouteSSRAdapter(options: StandaloneRouteSSRAdapterOptions) {
  return new StandaloneRouteSSRAdapter(options);
}
