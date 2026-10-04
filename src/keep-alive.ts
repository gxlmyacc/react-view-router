import React, {
  Fragment,
  useCallback, useLayoutEffect, useImperativeHandle,
  useState, RefObject
} from 'react';
import type { ReactNode } from 'react';
import type { KeepAliveRenderUtils } from './render-utils';
import {
  KeepAliveActiveComponent,
  createAnchor,
  createAnchorText,
  KEEP_ALIVE_ANCHOR,
  KEEP_ALIVE_REPLACER,
  KEEP_ALIVE_KEEP_COPIES,
} from './keep-alive-dom';
import type { KeepAliveAnchorProps } from './keep-alive-dom';

export interface KeepAliveNode {
  name: string;
  node?: ReactNode,
  instance?: any,
  [key: string]: any
}

export interface KeepAliveProps {
  utils: KeepAliveRenderUtils,
  activeName: string,
  children?: ReactNode,
  extra?: Record<string, any>,
  anchorName?: string,
  anchorRef?: RefObject<any>,
  anchor?: ReactNode,
}

export interface KeepAliveRefObject {
  ready: number,
  activeName: string,
  activeNode: KeepAliveNode|undefined,
  extra: Record<string, any>,
  current: null|Element|ChildNode|Comment,
  nodes: KeepAliveNode[],
  remove: (name: string, triggerRender?: boolean) => number,
  find: (name: string) => KeepAliveNode|undefined,
}

const KeepAlive: React.ForwardRefExoticComponent<
KeepAliveProps & React.RefAttributes<KeepAliveRefObject>
> = React.forwardRef(
  (props, ref) => {
    const { activeName, anchorName = '', anchor, anchorRef, utils, children, extra = {} } = props;
    const [ready, setReady] = useState(0);
    const [nodes, setNodes] = useState<Array<KeepAliveNode>>([]);
    const [$refs] = useState<KeepAliveRefObject>(() => Object.assign(anchorRef || { current: null }, { activeName: '' } as any));
    $refs.ready = ready;
    $refs.nodes = nodes;
    $refs.extra = extra;
    $refs.remove = useCallback(
      (name: string, triggerRender = true) => {
        const idx = nodes.findIndex((res) => res.name === name);
        if (~idx) {
          nodes.splice(idx, 1);
          if (triggerRender) setNodes([...nodes]);
        }
        return idx;
      },
      [nodes]
    );
    $refs.find = useCallback(
      (name: string) => nodes.find((res) => res.name === name),
      [nodes]
    );

    useImperativeHandle(ref, () => $refs);
    useLayoutEffect(() => {
      const current = $refs.current;
      if (anchorRef) $refs.current = anchorRef.current;
      setReady((prevReady) => {
        if (!$refs.current) return 0;
        return $refs.current === current ? (prevReady || 1) : prevReady + 1;
      });
    }, [$refs, anchorRef]);

    useLayoutEffect(() => {
      if (!activeName) {
        $refs.activeName = '';
        return;
      }
      $refs.activeName = activeName;
      setNodes((previousNodes) => {
        const nextNodes = previousNodes.slice();
        const idx = nextNodes.findIndex((res) => res.name === activeName);
        if (~idx) {
          if (children == null) nextNodes.splice(idx, 1);
          else nextNodes[idx] = { ...nextNodes[idx], node: children };
        } else {
          nextNodes.push(Object.assign({ name: activeName, node: children }, $refs.extra));
        }
        return nextNodes;
      });
    }, [$refs, children, activeName]);
    useLayoutEffect(() => {
      if (!activeName) {
        $refs.activeNode = undefined;
        return;
      }
      $refs.activeNode = nodes.find((v) => v.name === activeName);
    }, [$refs, activeName, nodes]);

    return React.createElement(
      Fragment,
      {},
      anchor || createAnchor(utils, $refs, createAnchorText(anchorName)),
      Boolean(ready) && nodes.map(({ name, node }) => React.createElement(
        KeepAliveActiveComponent,
        {
          active: name === activeName,
          anchor: $refs.current,
          name,
          key: name,
          utils,
        },
        node
      ))
    );
  }
);

export {
  KeepAliveAnchorProps,
  createAnchor,
  createAnchorText,
  KEEP_ALIVE_ANCHOR,
  KEEP_ALIVE_REPLACER,
  KEEP_ALIVE_KEEP_COPIES
};


export default KeepAlive;
