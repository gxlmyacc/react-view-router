import React, { RefObject } from 'react';
import type { ReactNode } from 'react';
import type { KeepAliveRenderUtils } from './render-utils';
declare const KEEP_ALIVE_ANCHOR = "keep-alive-anchor";
declare const KEEP_ALIVE_REPLACER = "keep-alive-replacer";
declare const KEEP_ALIVE_KEEP_COPIES = "keep-alive-keep-copies";
interface KeepAliveComponentProps {
    utils: KeepAliveRenderUtils;
    children?: ReactNode;
    active: boolean;
    name: string;
    anchor: Element | Comment | ChildNode | null;
    inner?: boolean;
    savePosition?: boolean;
}
/**
 * 挂载/卸载 KeepAlive 缓存节点的 DOM 适配层。
 * @param props 节点属性
 * @returns 激活态 portal 或 null
 */
declare function KeepAliveActiveComponent(props: KeepAliveComponentProps): React.ReactPortal | null;
export interface KeepAliveAnchorProps {
    utils: KeepAliveRenderUtils;
    children?: string;
}
declare const KeepAliveAnchor: React.ForwardRefExoticComponent<KeepAliveAnchorProps & React.RefAttributes<HTMLElement | null>>;
/**
 * 创建 KeepAlive 锚点节点。
 * @param utils DOM 工具集
 * @param ref 锚点引用
 * @param text 锚点文本
 * @returns React 节点
 */
declare function createAnchor(utils: KeepAliveRenderUtils, ref: RefObject<any> | null, text?: string): ReactNode;
/**
 * 生成锚点展示文本。
 * @param anchorName 锚点名称
 * @returns 锚点文本
 */
declare function createAnchorText(anchorName: string): string;
export { KeepAliveActiveComponent, KeepAliveAnchor, createAnchor, createAnchorText, KEEP_ALIVE_ANCHOR, KEEP_ALIVE_REPLACER, KEEP_ALIVE_KEEP_COPIES, };
