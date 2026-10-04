import ReactDOM from 'react-dom';
import type { ReactRenderUtils } from '../..';

const renderUtils: ReactRenderUtils = {
  /** sessionStorage */
  getSessionStorage: () => globalThis.sessionStorage,

  /** position */
  getPosition: (container) => ({ x: container.scrollLeft, y: container.scrollTop }),
  setPosition: (container, position) => {
    if (container.scrollTo) container.scrollTo(position.x || 0, position.y || 0);
    else { container.scrollLeft = position.x || 0; container.scrollTop = position.y || 0; }
  },
  queryPositionTarget: (container, selector) => container.querySelector<HTMLElement>(selector),

  /** ReactDOM */
  createPortal: ReactDOM.createPortal,
  findDOMNode: ReactDOM.findDOMNode,
  unmountComponentAtNode: ReactDOM.unmountComponentAtNode,

  /** document */
  createElement: (...args) => globalThis.document.createElement(...args),
  createDocumentFragment: () => globalThis.document.createDocumentFragment(),
  createComment: (data: string) => globalThis.document.createComment(data),

  /** Node */
  appendChild: (el, child) => el.appendChild(child),
  removeChild: (el, child) => el.removeChild(child),
  insertBefore: (el, newNode, referenceNode) => el.insertBefore(newNode, referenceNode),
  replaceChild: (el, node, child) => el.replaceChild(node, child),

  /** ChildNode */
  replaceWith: (el, ...nodes) => el.replaceWith(...nodes),
  remove: (el) => el.remove(),
};

export default renderUtils;
