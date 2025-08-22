import React, { useMemo, useState } from 'react';
import {
  RouterView as RouterViewOrigin,
  useRouter, useMatchedRouteIndex,
  isPlainObject, isFunction, getSessionStorage, setSessionStorage, nextTick
} from 'react-view-router';
import SwitchTransition from './SwitchTransition';
import CSSTransition from './CSSTransition';

import './router-view.css';

const SAVED_POSITION_KEY = '_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_';

/**
 * @param {import('react-view-router').Route} to
 */
function isPush(to) {
  return to && (to.action === 'PUSH' || to.params.isPush || to.query.isPush);
}
/**
 * @param {import('react-view-router').Route} to
 * @param {import('react-view-router').Route} [prevRoute]
 */
function isPop(to, prevRoute) {
  return (!to && prevRoute) || to.action === 'POP' || to.params.isBack || to.params.isPop || to.query.back;
}
/**
 * @param {import('react-view-router').Route} to
 * @param {import('react-view-router').Route} [prevRoute]
 */
function isReplace(to, prevRoute) {
  return to && to.action === 'REPLACE' && !isPush(to) && !isPop(to, prevRoute);
}

/**
 * @typedef {import('react-view-router').RouterView} RouterView
 * @typedef {import('../types/router-view').TransitionRouterViewProps} TransitionRouterViewProps
 */

/**
 * @type {React.ForwardRefExoticComponent<TransitionRouterViewProps & React.RefAttributes<RouterView>>}
 */
const RouterViewTransition = React.forwardRef(
  (props, ref) => {
    let {
      name,
      transition = 'slide',
      transitionPrefix = 'react-view-router-',
      transitionZIndex = 1000,
      transitionFallback = '',
      routerView,

      router: defaultRouter,
      container,
      containerStyle = {},

      onScrollToPosition,
      onSavePosition,

      ...restProps
    } = props;
    const router = useRouter(defaultRouter);
    const matchedRouteIndex = useMatchedRouteIndex();
    const savedPositionsKey = useMemo(() => `${name || 'default'}_${matchedRouteIndex}`, [name, matchedRouteIndex]);
    const [$refs] = useState(() => {
      const positions = getSessionStorage(SAVED_POSITION_KEY, true) || {};
      if (!positions[savedPositionsKey]) positions[savedPositionsKey] = {};
      return {
        positions,
        onScrollToPosition,
        onSavePosition
      };
    });
    $refs.onScrollToPosition = onScrollToPosition;
    $refs.onSavePosition = onSavePosition;

    if (routerView === RouterViewTransition) routerView = null;

    const backgroundColor = useMemo(
      () => (containerStyle && containerStyle.backgroundColor)
        || document.defaultView.getComputedStyle(document.body, null).getPropertyValue('background-color'),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [containerStyle && containerStyle.backgroundColor]
    );

    containerStyle = { height: '100%', ...containerStyle };
    let containerTag = 'div';
    if (isPlainObject(transition)) {
      transitionZIndex = transition.zIndex || transitionZIndex;
      containerStyle = Object.assign(containerStyle, transition.containerStyle);
      containerTag = transition.containerTag || containerTag;
      transition = transition.name || 'slide';
    }

    const transitionMap = useMemo(() => {
      const isSlideNode = node => node && node.className.includes(transitionPrefix + 'slide');
      const isFadeNode = node => node && node.className.includes(transitionPrefix + 'fade');

      const _savePosition = maybeNode => {
        const node = maybeNode && maybeNode.children[0];
        const to = router.currentRoute;
        if (node && isPush(to)) {
          const from = router.prevRoute;
          const key = from ? from.path : '-';
          // const matchedRoute = to && to.matched[matchedRouteIndex + 1];
          const position = from?.metaComputed.savePosition
            ? { x: node.scrollLeft, y: node.scrollTop }
            : ($refs.onSavePosition ? $refs.onSavePosition(node, { to, from }) : null);
          if (position && (position.x || position.y)) {
            $refs.positions[savedPositionsKey][key] = position;
            setSessionStorage(SAVED_POSITION_KEY, $refs.positions);
          }
        }
      };
      const _scrollToPosition = maybeNode => {
        const node = maybeNode && maybeNode.children[0];
        const to = router.currentRoute;
        if (node && isPop(to, router.prevRoute)) {
          const key = to ? to.path : '-';
          const savedPosition = $refs.positions[savedPositionsKey][key];
          if (savedPosition) {
            if ($refs.onScrollToPosition) $refs.onScrollToPosition(node, savedPosition);
            else node.scrollTo(savedPosition.x, savedPosition.y);
            delete $refs.positions[savedPositionsKey][key];
            setSessionStorage(SAVED_POSITION_KEY, $refs.positions);
          }
        }
      };
      const transitionProps = {
        addEndListener: (node, done) => {
          const to = router.currentRoute;
          if ((!isFadeNode(node) && isReplace(to, router.prevRoute))
            || node.className.includes('slide-right-enter')
            || node.className.includes('slide-left-exit')) {
            return done();
          }
          node.addEventListener('transitionend', done, false);
        },
        onEnter: maybeNode => {
          // if (maybeNode && $refs.route) {
          //   maybeNode.childNodes.forEach(node => {
          //     if (!node[KEEP_ALIVE_REPLACER]
          //       || node.$refs.mountRoot === maybeNode) return;
          //     node.mountView(maybeNode, node);
          //   })
          // }
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = transitionZIndex;
            if (backgroundColor) maybeNode.style.backgroundColor = backgroundColor;
          }
        },
        onEntering: maybeNode => {
          nextTick(() => _scrollToPosition(maybeNode));
        },
        onEntered: maybeNode => {
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = '';
            if (backgroundColor) maybeNode.style.backgroundColor = '';
          }
        },
        onExit: maybeNode => {
          _savePosition(maybeNode);
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = transitionZIndex;
            if (backgroundColor) maybeNode.style.backgroundColor = backgroundColor;
          }
        },
        onExited: maybeNode => {
          // if (maybeNode) {
          //   maybeNode.childNodes.forEach(node => {
          //     if (!node[KEEP_ALIVE_REPLACER]
          //       || node.$refs.mountRoot !== maybeNode) return;
          //     node.unmountView();
          //   })
          // }
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = '';
            if (backgroundColor) maybeNode.style.backgroundColor = '';
          }
        },
      };
      /**
       * @type {{
       *   [key: string]: {
       *     mode: string,
       *     props: Partial<any>
       * }}
       * */
      const map = {
        fade: {
          mode: 'out-in',
          props: {
            classNames: transitionPrefix + 'fade'
          }
        },
        slide: {
          mode: 'in-out',
          props: {
            classNames: () => {
              let ret = '';
              const to = router.currentRoute;
              if (isPush(to)) {
                ret = 'slide-left';
              } else if (isPop(to, router.prevRoute)) {
                ret = 'slide-right';
              } else {
                ret = isFunction(transitionFallback) ? transitionFallback(to) : transitionFallback;
              }
              return ret ? `${transitionPrefix}${ret}` : ret;
            },
          }
        },
        carousel: {
          mode: 'together',
          props: {
            classNames: () => {
              let ret = '';
              const to = router.currentRoute;
              if (isPush(to)) {
                ret = 'carousel-left';
              } else if (isPop(to, router.prevRoute)) {
                ret = 'carousel-right';
              } else {
                ret = isFunction(transitionFallback) ? transitionFallback(to) : transitionFallback;
              }
              return ret ? `${transitionPrefix}${ret}` : ret;
            },
          }
        }
      };
      const transitionItem = map[transition];
      if (transitionItem) Object.assign(transitionItem.props, transitionProps);

      return transitionItem || { mode: '', props: {} };
    }, [
      $refs, matchedRouteIndex, savedPositionsKey, router,
      transitionFallback, transition, transitionPrefix, transitionZIndex, backgroundColor
    ]);

    return React.createElement(routerView || RouterViewOrigin, {
      ref: ref ? { ref } : undefined,
      name,
      router: defaultRouter,
      container: transition
        ? (result, route, props, view) => {
          if (container) result = container(result, route, props, view);
          // if (view.state.enableKeepAlive) return result;
          // console.log('router-view container', route, route.path, this.transitionName, router.stacks.length);
          return React.createElement(
            SwitchTransition,
            {
              mode: transitionMap.mode
            },
            React.createElement(
              CSSTransition,
              {
                key: route.path,
                ...transitionMap.props
              },
              React.createElement(containerTag, {
                style: containerStyle,
              // [`data-${KEEP_ALIVE_KEEP_COPIES}`]: true,
              }, result)
            )
          );
        }
        : container,
      ...restProps
    });
  }
);

export {
  SAVED_POSITION_KEY
};

export default RouterViewTransition;
