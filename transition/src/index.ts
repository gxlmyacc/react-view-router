// @ts-nocheck -- upstream react-transition-group subpath declarations are not available in this package.
import Transition from 'react-transition-group/Transition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import ReplaceTransition from 'react-transition-group/ReplaceTransition';
import TransitionGroupContext from 'react-transition-group/TransitionGroupContext';
import SwitchTransition from './SwitchTransition';
import CSSTransition from './CSSTransition';
import RouterView from './RouterView';
export type { TransitionName, TransitionRouterViewProps } from '../types/router-view';

export {
  CSSTransition,
  SwitchTransition,
  ReplaceTransition,
  Transition,
  TransitionGroup,
  TransitionGroupContext,
  RouterView as RouterViewTransition
};

export default RouterView;
