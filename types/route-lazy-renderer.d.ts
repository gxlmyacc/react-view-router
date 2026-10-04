import React from 'react';
import type { ConfigRoute, ReactAllComponentType } from './types';
import type { RouteLazy } from './route-lazy';
import type ReactViewRouter from './router';
export interface BrowserRouteRendererProps {
    component: ReactAllComponentType | null;
    componentProps?: any;
    componentRef?: any;
}
export interface RouteLazyRendererProps extends Omit<BrowserRouteRendererProps, 'component'> {
    lazy: RouteLazy;
    route?: ConfigRoute;
    router?: ReactViewRouter;
    viewName?: string;
}
export declare function renderBrowserRoute(component: ReactAllComponentType | null, componentProps: any, componentRef?: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
export declare function BrowserRouteRenderer({ component, componentProps, componentRef, }: BrowserRouteRendererProps): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
export declare function RouteLazyRenderer({ lazy, componentProps, componentRef, route, router, viewName, }: RouteLazyRendererProps): React.FunctionComponentElement<{
    component: ReactAllComponentType<any> | null;
    componentProps: any;
    componentRef: any;
}> | React.FunctionComponentElement<{
    lazy: RouteLazy<any>;
    componentProps: any;
    componentRef: any;
    route: ConfigRoute | undefined;
    router: ReactViewRouter | undefined;
    viewName: string;
}>;
