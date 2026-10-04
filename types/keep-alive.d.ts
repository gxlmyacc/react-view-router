import React, { RefObject } from 'react';
import type { ReactNode } from 'react';
import type { KeepAliveRenderUtils } from './render-utils';
import { createAnchor, createAnchorText, KEEP_ALIVE_ANCHOR, KEEP_ALIVE_REPLACER, KEEP_ALIVE_KEEP_COPIES } from './keep-alive-dom';
import type { KeepAliveAnchorProps } from './keep-alive-dom';
export interface KeepAliveNode {
    name: string;
    node?: ReactNode;
    instance?: any;
    [key: string]: any;
}
export interface KeepAliveProps {
    utils: KeepAliveRenderUtils;
    activeName: string;
    children?: ReactNode;
    extra?: Record<string, any>;
    anchorName?: string;
    anchorRef?: RefObject<any>;
    anchor?: ReactNode;
}
export interface KeepAliveRefObject {
    ready: number;
    activeName: string;
    activeNode: KeepAliveNode | undefined;
    extra: Record<string, any>;
    current: null | Element | ChildNode | Comment;
    nodes: KeepAliveNode[];
    remove: (name: string, triggerRender?: boolean) => number;
    find: (name: string) => KeepAliveNode | undefined;
}
declare const KeepAlive: React.ForwardRefExoticComponent<KeepAliveProps & React.RefAttributes<KeepAliveRefObject>>;
export { KeepAliveAnchorProps, createAnchor, createAnchorText, KEEP_ALIVE_ANCHOR, KEEP_ALIVE_REPLACER, KEEP_ALIVE_KEEP_COPIES };
export default KeepAlive;
