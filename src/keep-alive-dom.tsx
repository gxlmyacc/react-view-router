import React, {
  useRef, useCallback, useLayoutEffect, useImperativeHandle,
  useState, RefObject
} from 'react';
import type { ReactNode } from 'react';
import type { ReactRenderUtils } from './types';
import { innumerable } from './util';

const KEEP_ALIVE_ANCHOR = 'keep-alive-anchor';
const KEEP_ALIVE_REPLACER = 'keep-alive-replacer';
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

/**
 * 挂载/卸载 KeepAlive 缓存节点的 DOM 适配层。
 * @param props 节点属性
 * @returns 激活态 portal 或 null
 */
function KeepAliveActiveComponent(props: KeepAliveComponentProps) {
  const { utils, active, children, name, anchor = null, inner } = props;
  const { appendChild, insertBefore } = utils;
  const [$refs] = useState(() => {
    // The portal target must remain an ancestor of its children while visible.
    // Moving children out of a DocumentFragment breaks React's delegated events.
    const holder = utils.createElement('div') as HTMLElement;
    holder.style.display = 'contents';
    if (holder.style.display !== 'contents') holder.style.display = 'block';
    const cache = utils.createDocumentFragment();
    return {
      name,
      inner,
      holder,
      cache,
      active,
      anchor,
      anchorRoot: null as any,
      mountRoot: null as any,
      insertBefore,
      appendChild,
      position: null as ({ x: number, y: number }|null),
    };
  });
  $refs.anchor = anchor;
  $refs.anchorRoot = anchor ? (inner ? anchor : anchor.parentNode) : null;
  $refs.active = $refs.active || active;

  const mountView = useCallback((mountRoot, anchor) => {
    if (!anchor || !mountRoot) return;
    const { holder, appendChild, insertBefore, inner } = $refs;
    if (anchor.mountName && anchor.mountName !== $refs.name) {
      anchor.unmountView();
    }
    if (inner) appendChild(mountRoot, holder);
    else insertBefore(mountRoot, holder, anchor);
    anchor.mountName = $refs.name;
    $refs.mountRoot = mountRoot;

    const position = $refs.position;
    if (position && mountRoot.scrollTo) mountRoot.scrollTo(position.x, position.y);
  }, [$refs]);

  const unmountView = useCallback(() => {
    const { active, mountRoot, holder, cache, anchor, inner } = $refs;
    if (!active || !mountRoot) return;
    const position = { x: mountRoot.scrollLeft, y: mountRoot.scrollTop };
    const keepCopy = Boolean(mountRoot.dataset?.keepAliveKeepCopies);
    const copy = keepCopy ? holder.cloneNode(false) as HTMLElement : null;
    if (copy) {
      Array.prototype.forEach.call(holder.childNodes, (child: ChildNode) => {
        copy.appendChild(child.cloneNode(false));
      });
    }
    appendChild(cache, holder);
    if (copy) {
      if (inner || !mountRoot.contains(anchor)) appendChild(mountRoot, copy);
      else insertBefore(mountRoot, copy, anchor);
    }
    $refs.mountRoot = null;
    $refs.position = (position.x || position.y) ? position : null;
    if ((anchor as any).mountName === $refs.name) (anchor as any).mountName = '';
  }, [$refs, appendChild, insertBefore]);

  useLayoutEffect(() => {
    if (!anchor) return;
    if (!(anchor as any).unmountView) {
      (anchor as any).unmountView = function () {
        if (!this.mountName || !this[KEEP_ALIVE_REPLACER]) return;
        const replacer = this[KEEP_ALIVE_REPLACER];
        const item = replacer && replacer[this.mountName];
        item && item.unmountView();
      };
    }
    let replacer = (anchor as any)[KEEP_ALIVE_REPLACER];
    if (!replacer) {
      replacer = {};
      innumerable(anchor, KEEP_ALIVE_REPLACER, replacer);
    }
    const item = replacer[$refs.name] = {} as any;
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

export interface KeepAliveAnchorProps {
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

/**
 * 创建 KeepAlive 锚点节点。
 * @param utils DOM 工具集
 * @param ref 锚点引用
 * @param text 锚点文本
 * @returns React 节点
 */
function createAnchor(utils: ReactRenderUtils, ref: RefObject<any>|null, text: string = ''): ReactNode {
  return React.createElement<any>(KeepAliveAnchor, { ref, utils }, text);
}

/**
 * 生成锚点展示文本。
 * @param anchorName 锚点名称
 * @returns 锚点文本
 */
function createAnchorText(anchorName: string) {
  return anchorName ? `${KEEP_ALIVE_ANCHOR} ${anchorName}` : KEEP_ALIVE_ANCHOR;
}

export {
  KeepAliveActiveComponent,
  KeepAliveAnchor,
  createAnchor,
  createAnchorText,
  KEEP_ALIVE_ANCHOR,
  KEEP_ALIVE_REPLACER,
  KEEP_ALIVE_KEEP_COPIES,
};
