import React from 'react';
import type { RouterViewProps } from '../..';
import type { RouterDrawerOptions } from './context';
export interface RouterDrawerProps extends RouterViewProps, Partial<RouterDrawerOptions> {
    [key: string]: any;
}
declare const RouterDrawer: React.ForwardRefExoticComponent<Pick<RouterDrawerProps, keyof RouterDrawerProps> & React.RefAttributes<unknown>>;
export default RouterDrawer;
