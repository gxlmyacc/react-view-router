import SwitchTransition from 'react-transition-group/SwitchTransition';
import Transition from 'react-transition-group/Transition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import ReplaceTransition from 'react-transition-group/ReplaceTransition';
import TransitionGroupContext from 'react-transition-group/TransitionGroupContext';
import CSSTransition from './CSSTransition';
import RouterView from './router-view';

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
