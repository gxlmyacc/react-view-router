import React, { useMemo } from 'react';
import { RouterView as RouterViewOrigin, useRouter, isPlainObject, isFunction } from 'react-view-router';
import SwitchTransition from './SwitchTransition';
import CSSTransition from './CSSTransition';

import './router-view.css';

function isPush(to) {
  return to.action === 'PUSH' || to.params.isPush || to.query.isPush;
}

function isPop(to) {
  return to.action === 'POP' || to.params.isBack || to.params.isPop || to.query.back;
}

function isReplace(to) {
  return to.action === 'REPLACE' && !isPush(to) && !isPop(to);
}

/**
 * @typedef {import('react-view-router').RouterView} RouterView
 */

const RouterViewTransition = React.forwardRef(
  /**
   *
   * @param {import('../types/router-view').TransitionRouterViewProps} props
   * @param {React.Ref<RouterView>} ref
   * @returns
   */
  (props, ref) => {
    let {
      transition = 'slide',
      transitionPrefix = 'react-view-router-',
      transitionZIndex = 1000,
      transitionFallback = '',
      routerView,

      router: defaultRouter,
      container,
      containerStyle = {},

      ...restProps
    } = props;
    const router = useRouter(defaultRouter);

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
      const transitionProps = {
        addEndListener: (node, done) => {
          const to = router.currentRoute;
          if ((!isFadeNode(node) && isReplace(to))
            || node.className.includes('slide-right-enter')
            || node.className.includes('slide-left-exit')) {
            return done();
          }
          node.addEventListener('transitionend', done, false);
        },
        onEnter: maybeNode => {
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = transitionZIndex;
            if (backgroundColor) maybeNode.style.backgroundColor = backgroundColor;
          }
        },
        onEntered: maybeNode => {
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = '';
            if (backgroundColor) maybeNode.style.backgroundColor = '';
          }
        },
        onExit: maybeNode => {
          if (isSlideNode(maybeNode)) {
            if (transitionZIndex) maybeNode.style.zIndex = transitionZIndex;
            if (backgroundColor) maybeNode.style.backgroundColor = backgroundColor;
          }
        },
        onExited: maybeNode => {
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
              } else if (isPop(to)) {
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
              } else if (isPop(to)) {
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
    }, [router, transitionFallback, transition, transitionPrefix, transitionZIndex, backgroundColor]);

    return React.createElement(routerView || RouterViewOrigin, {
      ref,
      router: defaultRouter,
      container: (result, route) => {
        if (container) result = container(result, route);
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
              style: containerStyle
            }, result)
          )
        );
      },
      ...restProps
    });
  }
);

export default RouterViewTransition;
