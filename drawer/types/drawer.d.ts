import React from 'react';
import type { RouterDrawerOptions } from './context';
type DrawerProps = {
    touchThreshold?: number;
    position?: RouterDrawerOptions['position'];
    portalContainer?: () => HTMLElement | null;
} & {
    [key: string]: any;
};
type DrawerState = {
    visible: boolean;
    phase: 'enter' | 'enter-active' | 'leave' | 'leave-active' | '';
};
declare class Drawer extends React.Component<DrawerProps, DrawerState> {
    closed: boolean;
    isTouching: boolean | null;
    drawerRef: HTMLElement | null;
    private portalTarget;
    private holdsBodyLock;
    private touchTimer;
    touchStart: {
        x: number;
        y: number;
    } | null;
    animationTimer: ReturnType<typeof setTimeout> | null;
    activationTimer: ReturnType<typeof setTimeout> | null;
    static defaultProps: {
        prefixCls: string;
        className: string;
        mask: boolean;
        open: boolean;
        maskClosable: boolean;
        touch: boolean;
        touchThreshold: number;
        delay: number;
    };
    constructor(props: DrawerProps);
    componentDidMount(): void;
    componentDidUpdate(previousProps: DrawerProps): void;
    componentWillUnmount(): void;
    onTouchStart(event: React.TouchEvent): void;
    private getTouchMovement;
    onNativeTouchMove(event: React.TouchEvent): void;
    onNativeTouchEnd(event: React.TouchEvent): void;
    onPanelAnimationEnd(event: React.AnimationEvent): void;
    onTouchMove(event: {
        dir: string;
        deltaX: number;
    }): void;
    onTouchEnd(event: {
        dir: string;
        deltaX: number;
    }): void;
    private resetTouch;
    private finishTouch;
    onTouchCancel: (event: React.TouchEvent) => void;
    getContainer(): HTMLElement | null;
    getZIndexStyle(): {
        zIndex?: number;
    };
    getWrapStyle(): any;
    private getAlignmentStyle;
    getMaskStyle(): any;
    getMaskTransitionName(): any;
    getTransitionName(): any;
    getDrawerElement(): React.DetailedReactHTMLElement<{
        key: string;
        role: string;
        ref: (el: HTMLElement) => HTMLElement;
        style: any;
        className: string;
        open: any;
        onAnimationEnd: (event: React.AnimationEvent) => void;
        onTouchStart: (event: React.TouchEvent) => void;
        onTouchMove: (event: React.TouchEvent) => void;
        onTouchEnd: (event: React.TouchEvent) => void;
        onTouchCancel: (event: React.TouchEvent) => void;
        onClick: (event: React.MouseEvent) => void;
    }, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
        style: React.CSSProperties;
        onTouchStart: (event: React.TouchEvent) => void;
        onTouchMove: (event: React.TouchEvent) => void;
        onTouchEnd: (event: React.TouchEvent) => void;
        onTouchCancel: (event: React.TouchEvent) => void;
    }, HTMLElement>;
    restoreOverflow(): void;
    onAnimateAppear(): void;
    private syncOverflow;
    onAnimateLeave(): void;
    close(e?: any): void;
    onMaskClick(e: React.SyntheticEvent): void;
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
}
export default Drawer;
