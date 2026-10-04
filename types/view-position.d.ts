import type ReactViewRouter from './router';
import type { Route } from './types';
import type { RouterViewProps } from './router-view';
export declare const SAVED_POSITION_KEY = "_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_";
export interface PositionNavigation {
    to: Route;
    from: Route | null;
}
/** Owns navigation position state without accessing host elements. */
export default class ViewPosition {
    private warnings;
    private warning;
    private container;
    private target;
    private records;
    private persist;
    save(router: ReactViewRouter, props: RouterViewProps<any>, name: string, depth: number, navigation: PositionNavigation): void;
    restore(router: ReactViewRouter, props: RouterViewProps<any>, name: string, depth: number, navigation: PositionNavigation): void;
}
