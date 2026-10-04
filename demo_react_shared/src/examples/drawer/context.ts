import React from 'react';

export type DrawerLifecycleEvent = 'mount' | 'unactivate' | 'activate' | 'hookDeactivate' | 'hookActivate';
export type RecordDrawerEvent = (event: DrawerLifecycleEvent) => void;

export const DrawerLogContext = React.createContext<RecordDrawerEvent>(() => {});
