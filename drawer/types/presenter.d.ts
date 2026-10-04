import React from 'react';
import type { RouterViewPresenterProps } from '../..';
interface PresenterState {
    routePath: string | null;
    open: boolean;
    displayed: React.ReactNode;
}
/** Places a child route in a Drawer without changing RouterView's matching or KeepAlive logic. */
export default class ComposedRouterDrawerPresenter extends React.Component<RouterViewPresenterProps, PresenterState> {
    static contextType: React.Context<import("./context").RouterDrawerOptions>;
    constructor(props: RouterViewPresenterProps);
    static getDerivedStateFromProps(props: RouterViewPresenterProps, state: PresenterState): Partial<PresenterState> | null;
    componentDidUpdate(previousProps: RouterViewPresenterProps, previousState: PresenterState): void;
    handleClose: () => void;
    handleLeave: () => void;
    render(): React.ReactNode;
}
export {};
