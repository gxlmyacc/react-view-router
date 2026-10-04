import React from 'react';
import type { MatchedRoute } from '../..';
export interface RouterDrawerOptions {
    prefixCls: string;
    position: 'right' | 'left' | 'bottom' | 'top' | 'center';
    /** Show a backdrop. Defaults to true. */
    mask: boolean;
    /** Close on backdrop clicks. Defaults to false. */
    maskClosable: boolean;
    /** CSS panel dimensions; numbers are pixels. Defaults to 100%. */
    width?: React.CSSProperties['width'];
    height?: React.CSSProperties['height'];
    /** CSS maximum panel dimensions; numbers are pixels. */
    maxWidth?: React.CSSProperties['maxWidth'];
    maxHeight?: React.CSSProperties['maxHeight'];
    drawerClassName?: string;
    portalContainer?: () => HTMLElement | null;
    touch: boolean;
    delay: number;
    zIndex?: number | ((route: MatchedRoute, context: {
        config: unknown;
        view: unknown;
    }) => number);
}
declare const RouterDrawerContext: React.Context<RouterDrawerOptions>;
export default RouterDrawerContext;
