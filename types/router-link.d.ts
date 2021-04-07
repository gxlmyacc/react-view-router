import React from 'react';
import ReactViewRouter from './router';
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
    href?: string;
    onRouteChange?: (route: any) => void;
    [key: string]: any;
}
interface RouterLinkState {
    inited: boolean;
    currentRoute: any;
    parentRoute: any;
    router?: ReactViewRouter;
    seed: number;
}
declare class RouterLink extends React.Component<RouterLinkProps, RouterLinkState> {
    static propTypes: any;
    static defaultProps: {
        tag: string;
        activeClass: string;
        exactActiveClass: string;
        event: string;
    };
    private unplugin?;
    constructor(props: RouterLinkProps);
    _remount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterLinkProps, nextState: RouterLinkState): boolean;
    componentDidUpdate(prevProps: RouterLinkProps): void;
    render(): React.ReactElement<{
        readonly [x: string]: any;
        disabled?: boolean | undefined;
        className?: string | undefined;
        href?: string | undefined;
        onRouteChange?: ((route: any) => void) | undefined;
    } & {
        [key: string]: (e: any) => void;
    }, string | React.JSXElementConstructor<any>> | null;
}
export { RouterLink };
export default function createRouterLink(router: ReactViewRouter): React.ForwardRefExoticComponent<Pick<RouterLinkProps, string | number> & React.RefAttributes<RouterLink>>;
