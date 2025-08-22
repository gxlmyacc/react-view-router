import React, {
  Fragment,
  useRef, useCallback, useLayoutEffect, useImperativeHandle,
  useState, RefObject, useMemo
} from 'react';
import type { ReactNode } from 'react';
import type { ReactRenderUtils } from './types';
import { innumerable } from './util';

const KEEP_ALIVE_ANCHOR = 'keep-alive-anchor';
const KEEP_ALIVE_REPLACER = 'keep-alive-replacer';
const KEEP_ALIVE_POSITION = 'keep-alive-position';
const KEEP_ALIVE_KEEP_COPIES = 'keep-alive-keep-copies';
interface KeepAliveComponentProps {
  utils: ReactRenderUtils,
  children?: ReactNode,
  active: boolean
  name: string
  anchor: Element|Comment|ChildNode|null,
  inner?: boolean,
  savePosition?: boolean,
}

function Component(props: KeepAliveComponentProps) {
  const { utils, active, children, name, anchor = null, inner } = props;
  const { appendChild, insertBefore } = utils;
  const [$refs] = useState(() => {
    const holder = utils.createDocumentFragment();
    return {
      name,
      inner,
      holder,
      active,
      anchor,
      anchorRoot: null as any,
      mountRoot: null as any,
      childNodes: [] as any[],
      unmounting: false,
      insertBefore,
      appendChild,
      position: null as ({ x: number, y: number }|null),
    };
  });
  $refs.anchor = anchor;
  $refs.anchorRoot = useMemo(() => {
    const { anchor } = $refs;
    if (!anchor) return null;
    return inner ? anchor : (anchor.parentNode || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$refs.anchor, inner]);
  $refs.active = $refs.active || active;
  $refs.insertBefore = insertBefore;
  $refs.appendChild = appendChild;

  useLayoutEffect(() => {
    const unhooks: (() => void)[] = [];
    const hook = (
      el: any,
      methodName: string,
      cb?: (...args: any[]) => any,
      replacer?: (origin: Function, ...args: any[]) => any,
    ) => {
      const old = el[methodName];
      if (!old || old._hooked) {
        console.error(`[keep-alive]warning: hook method "${methodName}" ${old ? 'already hooked' : 'not exist'}!`);
        return;
      }
      const newMethod = function () {
        const { mountRoot, active, unmounting } = $refs;
        if (!mountRoot || !active || unmounting) return old.apply(this, arguments);
        // @ts-ignore
        // eslint-disable-next-line prefer-spread
        cb && cb.apply(this, arguments);
        if (replacer) return replacer(old, ...arguments);
        // eslint-disable-next-line prefer-spread
        return (mountRoot as any)[methodName].apply(mountRoot, arguments);
      };
      newMethod._hooked = true;
      el[methodName] = newMethod;
      unhooks.push(() => el[methodName] = old);
    };
    hook($refs.holder, 'appendChild', node => {
      $refs.childNodes.push(node);
    }, $refs.inner ? undefined : (fn, node) => $refs.anchorRoot.insertBefore(node, $refs.anchor));
    hook($refs.holder, 'removeChild', node => {
      const idx = $refs.childNodes.findIndex(v => v === node);
      if (~idx) $refs.childNodes.splice(idx, 1);
    });
    hook($refs.holder, 'insertBefore', (newNode, node) => {
      const idx = $refs.childNodes.findIndex(v => v === node);
      if (~idx) $refs.childNodes.splice(idx, 0, newNode);
    });
    hook($refs.holder, 'replaceChild', (newChild, oldChild) => {
      const idx = $refs.childNodes.findIndex(v => v === oldChild);
      if (~idx) $refs.childNodes.splice(idx, 1, newChild);
    });
    ['hasChildNodes', 'contains', 'getRootNode'].forEach(name => hook($refs.holder, name));
    return () => unhooks.forEach(cb => cb());
  }, [$refs, $refs.holder]);

  const mountView = useCallback((mountRoot, anchor) => {
    if (!anchor || !mountRoot) return;
    const { holder, appendChild, insertBefore, inner } = $refs;
    if (anchor.mountName && anchor.mountName !== $refs.name) {
      anchor.unmountView()
    }
    $refs.childNodes = [...holder.childNodes];
    $refs.childNodes.forEach(child => {
      if (inner) appendChild(mountRoot, child);
      else insertBefore(mountRoot, child, anchor);
      // if (child && child[KEEP_ALIVE_REPLACER] && child.mountName) {
      //   let replacer = (child as any)[KEEP_ALIVE_REPLACER];
      //   let item = replacer[child.mountName];
      //   item && item.mountView(mountRoot, child);
      // }
    });
    anchor.mountName = $refs.name;
    $refs.mountRoot = mountRoot;

    const position = $refs.position;
    if (position && mountRoot.scrollTo) mountRoot.scrollTo(position.x, position.y);
  }, [$refs]);

  const unmountView = useCallback(() => {
    const { childNodes, active } = $refs;
    if (!active || !childNodes.length) return;
    $refs.unmounting = true;
    try {
      const {
        appendChild, insertBefore, holder, mountRoot, anchor, inner
      } = $refs;
      const position = { x: mountRoot.scrollLeft, y: mountRoot.scrollTop };
      const isValidChild = anchor && mountRoot.contains(anchor);
      const nodes = childNodes.splice(0, childNodes.length);
      nodes.forEach(child => {
        if (child && child[KEEP_ALIVE_REPLACER]) child.unmountView();
        else {
          const p = { x: child.scrollLeft, y: child.scrollTop };
          innumerable(child, KEEP_ALIVE_POSITION, p.x || p.y ? p : null);
        }
        appendChild(holder, child);
        if (mountRoot.dataset?.keepAliveKeepCopies) {
          const cloneNode = child.cloneNode();
          if (inner || !isValidChild) appendChild(mountRoot, cloneNode);
          else insertBefore(mountRoot, cloneNode, anchor);
        }
      });
      $refs.mountRoot = null;
      $refs.position = (position.x || position.y) ? position : null;
      if ((anchor as any).mountName === $refs.name) (anchor as any).mountName = '';
    } finally {
      $refs.unmounting = false;
    }
  }, [$refs]);

  useMemo(() => {
    if (!anchor) return;
    if (!(anchor as any).unmountView) {
      (anchor as any).unmountView = function () {
        if (!this.mountName || !this[KEEP_ALIVE_REPLACER]) return;
        let replacer = this[KEEP_ALIVE_REPLACER];
        let item = replacer && replacer[this.mountName];
        item && item.unmountView();
      }
    }
    let replacer = (anchor as any)[KEEP_ALIVE_REPLACER];
    if (!replacer){
      replacer = {};
      innumerable(anchor, KEEP_ALIVE_REPLACER, replacer);
    }
    let item = replacer[$refs.name] = {} as any;
    item.$refs = $refs;
    item.unmountView = unmountView;
    item.mountView = mountView;
  }, [$refs, anchor, mountView, unmountView]);

  useLayoutEffect(() => {
    if (!$refs.active) return;
    const { anchor, anchorRoot, mountRoot } = $refs;
    if (mountRoot && !anchorRoot) unmountView();
    if (!anchorRoot) return;
    if (active) {
      if (anchorRoot !== mountRoot || (anchor as any).mountName !== $refs.name) mountView(anchorRoot, anchor);
    } else unmountView();
  }, [active, $refs, mountView, unmountView]);

  useLayoutEffect(() => () => {
    const { active, mountRoot } = $refs;
    if (active && mountRoot) unmountView();
  }, [$refs, unmountView]);

  return (
    $refs.active ? utils.createPortal(children, $refs.holder, name) : null
  );
}

export interface KeepAliveNode {
  name: string;
  node?: ReactNode,
  instance?: any,
  [key: string]: any
}

interface KeepAliveAnchorProps {
  utils: ReactRenderUtils,
  children?: string,
}

const KeepAliveAnchor: React.ForwardRefExoticComponent<
KeepAliveAnchorProps & React.RefAttributes<HTMLElement|null>
> = React.forwardRef(
  (props: KeepAliveAnchorProps, ref) => {
    const { utils, children = '' } = props;
    const anchorRef = useRef(null);

    useImperativeHandle(ref, () => anchorRef.current as any, [anchorRef]);

    useLayoutEffect(() => {
      const { current } = anchorRef;
      if (!current || (current as any)[KEEP_ALIVE_ANCHOR]) return;
      (current as any).style?.setProperty('display', 'none', 'important');
      innumerable(current, KEEP_ALIVE_ANCHOR, true);
    }, [anchorRef, utils]);

    useLayoutEffect(() => {
      const { current } = anchorRef;
      if (!current) return;
      if ((current as any).textContent != children) (current as any).textContent = children;
    }, [anchorRef, children]);

    return React.createElement('i', {
      key: KEEP_ALIVE_ANCHOR,
      style: { display: 'none' },
      ref: anchorRef
    });
  }
) as any;


function createAnchor(utils: ReactRenderUtils, ref: RefObject<any>|null, text: string = ''): ReactNode {
  return React.createElement<any>(KeepAliveAnchor, { ref, utils }, text);
}

function createAnchorText(anchorName: string) {
  return anchorName ? `${KEEP_ALIVE_ANCHOR} ${anchorName}` : KEEP_ALIVE_ANCHOR;
}

export interface KeepAliveProps {
  utils: ReactRenderUtils,
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
        const idx = nodes.findIndex(res => res.name === name);
        if (~idx) {
          nodes.splice(idx, 1);
          triggerRender && setNodes([...nodes]);
        }
        return idx;
      },
      [nodes]
    );
    $refs.find = useCallback(
      (name: string) => nodes.find(res => res.name === name),
      [nodes]
    );

    useImperativeHandle(ref, () => $refs);
    useLayoutEffect(() => {
      const current = $refs.current;
      anchorRef && ($refs.current = anchorRef.current);
      setReady(ready => {
        if (!$refs.current) return 0;
        return $refs.current === current ? (ready || 1) : ready + 1;
      });
    }, [$refs, anchorRef]);

    useLayoutEffect(() => {
      if (!activeName) {
        $refs.activeName = '';
        return;
      }
      const idx = nodes.findIndex(res => res.name === activeName);
      if (~idx) {
        if (children == null) nodes.splice(idx, 1);
        else nodes[idx].node = children;
      } else nodes.push(Object.assign({ name: activeName, node: children }, $refs.extra));
      $refs.activeName = activeName;
    }, [$refs, nodes, children, activeName]);
    useLayoutEffect(() => {
      if (!activeName) {
        $refs.activeNode = undefined;
        return;
      }
      $refs.activeNode = nodes.find(v => v.name === activeName);
    }, [$refs, activeName, nodes]);

    return React.createElement(
      Fragment,
      {},
      anchor || createAnchor(utils, $refs, createAnchorText(anchorName)),
      Boolean(ready) && nodes.map(({ name, node }) => React.createElement(
        Component,
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
