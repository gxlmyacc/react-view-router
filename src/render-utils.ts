import type { ReactRenderUtils, PartialReactRenderUtils } from './types';

/** Standards-mode page scrolling belongs to documentElement rather than body. */
function scrollContainer(container: HTMLElement): HTMLElement {
  const doc = globalThis.document;
  return container === doc?.body ? (doc.scrollingElement as HTMLElement || container) : container;
}

/** Browser host operations that do not require ReactDOM. Globals are read only on invocation. */
const defaultRenderUtils: Omit<ReactRenderUtils, 'reactDOM'> = {
  storage: {
    getSessionStorage: () => {
      try { return globalThis.sessionStorage || null; } catch (_) { return null; }
    },
  },
  position: {
    getDefaultPositionContainer: () => globalThis.document?.body || null,
    getPosition: (container) => {
      const target = scrollContainer(container);
      return { x: target.scrollLeft, y: target.scrollTop };
    },
    setPosition: (container, position) => {
      const target = scrollContainer(container);
      if (target.scrollTo) target.scrollTo(position.x || 0, position.y || 0);
      else { target.scrollLeft = position.x || 0; target.scrollTop = position.y || 0; }
    },
    queryPositionTarget: (container, selector) => container.querySelector<HTMLElement>(selector),
  },
  document: {
    createElement: (tagName) => globalThis.document.createElement(tagName),
    createDocumentFragment: () => globalThis.document.createDocumentFragment(),
    createComment: (data) => globalThis.document.createComment(data),
  },
  node: {
    appendChild: (el, child) => el.appendChild(child),
    removeChild: (el, child) => el.removeChild(child),
    insertBefore: (el, node, reference) => el.insertBefore(node, reference),
    replaceChild: (el, node, child) => el.replaceChild(node, child),
    replaceWith: (el, ...nodes) => el.replaceWith(...nodes),
    remove: (el) => el.remove(),
  },
};

export type KeepAliveRenderUtils = {
  reactDOM: Pick<ReactRenderUtils['reactDOM'], 'createPortal'>;
  document: Pick<ReactRenderUtils['document'], 'createElement' | 'createDocumentFragment'>;
  node: Pick<ReactRenderUtils['node'], 'appendChild' | 'insertBefore'>;
};

/** Validate only the host operations used by KeepAlive, including partial custom adapters. */
export function assertKeepAliveRenderUtils(utils: PartialReactRenderUtils<any> | undefined): asserts utils is KeepAliveRenderUtils {
  const methods = [
    ['reactDOM.createPortal', utils?.reactDOM?.createPortal],
    ['document.createElement', utils?.document?.createElement],
    ['document.createDocumentFragment', utils?.document?.createDocumentFragment],
    ['node.appendChild', utils?.node?.appendChild],
    ['node.insertBefore', utils?.node?.insertBefore],
  ] as const;
  const missing = methods.filter(([, method]) => typeof method !== 'function').map(([name]) => name);
  if (missing.length) throw new Error(`enable keepAlive need renderUtils methods: ${missing.join(', ')}`);
}

export default defaultRenderUtils;
