import React, { RefObject } from 'react';
import type { ReactNode } from 'react';
import type { ReactRenderUtils } from './types';
declare const KEEP_ALIVE_ANCHOR = "keep-alive-anchor";
declare const KEEP_ALIVE_REPLACER = "keep-alive-replacer";
declare const KEEP_ALIVE_KEEP_COPIES = "keep-alive-keep-copies";
export interface KeepAliveNode {
    name: string;
    node?: ReactNode;
    instance?: any;
    [key: string]: any;
}
interface KeepAliveAnchorProps {
    utils: ReactRenderUtils;
    children?: string;
}
declare function createAnchor(utils: ReactRenderUtils, ref: RefObject<any> | null, text?: string): ReactNode;
declare function createAnchorText(anchorName: string): string;
export interface KeepAliveProps {
    utils: ReactRenderUtils;
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
