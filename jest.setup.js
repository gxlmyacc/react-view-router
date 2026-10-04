require('@testing-library/jest-dom');

/**
 * React 19 移除了 findDOMNode，为 react-transition-group 与过渡组件提供兼容替身。
 * @param componentOrElement 组件实例或 DOM 节点
 * @returns 对应 DOM 节点或 null
 */
function findDOMNodePolyfill(componentOrElement) {
  if (componentOrElement == null) return null;
  if (componentOrElement.nodeType === 1) return componentOrElement;
  const fiber = componentOrElement._reactInternals
    || componentOrElement._reactInternalInstance;
  if (!fiber) return null;
  let node = fiber;
  while (node) {
    if (node.stateNode && node.stateNode.nodeType === 1) {
      return node.stateNode;
    }
    node = node.child;
  }
  return null;
}

const ReactDOM = require('react-dom');
if (typeof ReactDOM.findDOMNode !== 'function') {
  ReactDOM.findDOMNode = findDOMNodePolyfill;
}
