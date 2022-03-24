import React from 'react';
import ReactViewRouter from './router';
import { Route } from './types';
import { RouterViewComponent } from './router-view';
declare function guardEvent(e: any): true | undefined;
interface RouterLinkProps {
    router?: ReactViewRouter;
    tag: string;
    event: string | string[];
    activeClass: string;
    exactActiveClass: string;
    to: string | {
        path: string;
    };
    exact?: boolean;
    replace?: boolean;
    append?: boolean;
    disabled?: boolean;
    children: React.ReactNode[];
    className?: string;
    onRouteChange?: (route: Route, routerLinkInstance: RouterLink) => void;
    onRouteActive?: (route: Route, routerLinkInstance: RouterLink) => void;
    onRouteInactive?: (route: Route, routerLinkInstance: RouterLink) => void;
    href?: string;
    [key: string]: any;
}
interface RouterLinkState {
    inited: boolean;
    routerView: RouterViewComponent | null;
    router?: ReactViewRouter;
    seed: number;
    isMatched: boolean;
}
declare class RouterLink extends React.Component<RouterLinkProps, RouterLinkState> {
    static propTypes: any;
    static defaultProps: {
        tag: string;
        activeClass: string;
        exactActiveClass: string;
        event: string | string[];
    };
    private unplugin?;
    constructor(props: RouterLinkProps);
    _remount(): void;
    getFallbackClassName(isMatched: boolean): string;
    isMatched(currentRoute?: Route | null, routerView?: RouterViewComponent | null): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterLinkProps, nextState: RouterLinkState): boolean;
    componentDidUpdate(prevProps: RouterLinkProps): void;
    render(): React.ReactNode[] | React.ReactElement<{
        readonly [x: string]: any;
        disabled?: boolean | undefined;
        className?: string | undefined;
        href?: string | undefined;
    } & {
        [key: string]: (e: any) => void;
    }, string | React.JSXElementConstructor<any>> | null;
}
export { RouterLinkProps, RouterLink, guardEvent };
export default function createRouterLink(router: ReactViewRouter): React.ForwardRefExoticComponent<Pick<RouterLinkProps, string | number> & React.RefAttributes<RouterLink>>;
