import ReactDOM from 'react-dom';
import type { ReactRenderUtils } from '../..';

const renderUtils: ReactRenderUtils = {
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
  remove: el => el.remove(),
};

export default renderUtils;
