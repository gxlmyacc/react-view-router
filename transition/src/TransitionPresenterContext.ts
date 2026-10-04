import React from 'react';
import type { PresenterOptions } from './types';

const TransitionPresenterContext = React.createContext<PresenterOptions | null>(null);

export default TransitionPresenterContext;
