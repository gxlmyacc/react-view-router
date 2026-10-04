import React from 'react';

export const KeepAliveLogContext = React.createContext<(event: string) => void>(() => {});
