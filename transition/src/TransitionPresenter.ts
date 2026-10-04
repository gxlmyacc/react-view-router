import React, { useContext } from 'react';
import TransitionPresenterContext from './TransitionPresenterContext';
import TransitionViewPresenter from './TransitionViewPresenter';
import type { TransitionPresenterProps } from './types';

/** Stable presenter identity keeps the route and KeepAlive tree mounted when animation settings change. */
export default function TransitionPresenter(props: Omit<TransitionPresenterProps, keyof import('./types').PresenterOptions>): React.ReactElement {
  const options = useContext(TransitionPresenterContext);
  if (!options) return React.createElement(React.Fragment, null, props.children);
  return React.createElement(TransitionViewPresenter, { ...props, ...options });
}
