import React from 'react';
declare type DrawerProps = {
    touchThreshold: number;
} & {
    [key: string]: any;
};
declare type DrawerState = {};
declare class Drawer extends React.Component<DrawerProps, DrawerState> {
    closed: boolean;
    isTouching: boolean | null;
    drawerRef: HTMLElement | null;
    container: HTMLElement | null;
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
    componentWillUnmount(): void;
    onTouchMove(event: {
        dir: string;
        deltaX: number;
    }): void;
    onTouchEnd(event: {
        dir: string;
        deltaX: number;
    }): void;
    removeContainer(): void;
    getContainer(): HTMLElement;
    getZIndexStyle(): {
        zIndex?: number | undefined;
    };
    getWrapStyle(): any;
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
    }, HTMLElement>;
    restoreOverflow(): void;
    onAnimateAppear(): void;
    onAnimateLeave(): void;
    close(e?: any): void;
    onMaskClick(e: React.SyntheticEvent): void;
    render(): React.ReactPortal | null;
}
export default Drawer;
