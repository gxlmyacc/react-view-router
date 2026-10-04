import React, { useMemo, useState, useCallback } from 'react';
import type { Route } from 'react-view-router';
import {
  RouterView as RouterViewOrigin,
  useRouter,
  isPlainObject, isFunction
} from 'react-view-router';
import type { TransitionRouterViewProps } from '../types/router-view';
import type { TransitionCallbacks, PresenterOptions } from './types';
import TransitionPresenter from './TransitionPresenter';
import TransitionPresenterContext from './TransitionPresenterContext';

import './RouterView.scss';

// Retained for consumers of the original transition storage key.
const SAVED_POSITION_KEY = '_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_';

/** 默认动效时长（ms），与 router-view.css 保持一致 */
const DEFAULT_TRANSITION_MS = 300;

/**
 * 判断 transitionend 是否为目标动画属性结束事件。
 * @param event transitionend 事件对象
 * @returns 是否为 transform 或 opacity 的过渡结束
 */
function isTransitionEndEvent(event: TransitionEvent): boolean {
  const prop = event.propertyName;
  return prop === 'transform'
    || prop === '-webkit-transform'
    || prop === 'opacity';
}

/**
 * Match the view's local backdrop instead of assuming the document body's color.
 */
function getViewBackgroundColor(node: HTMLElement, explicitColor?: string): string {
  if (explicitColor) return explicitColor;
  let parent = node && node.parentElement;
  while (parent) {
    const color = window.getComputedStyle(parent).backgroundColor;
    const alpha = color && color.match(/[,/]\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/);
    if (color && color !== 'transparent' && (!alpha || Number(alpha[1]) === 1)) return color;
    parent = parent.parentElement;
  }
  return '';
}


function isPush(to: Route | null): boolean {
  return Boolean(to && (to.action === 'PUSH' || to.params.isPush || to.query.isPush));
}

function isPop(to: Route | null, prevRoute?: Route | null): boolean {
  return Boolean((!to && prevRoute) || (to && (to.action === 'POP' || to.params.isBack || to.params.isPop || to.query.back)));
}

function isReplace(to: Route | null, prevRoute?: Route | null): boolean {
  return Boolean(to && to.action === 'REPLACE' && !isPush(to) && !isPop(to, prevRoute));
}


const RouterViewTransition = React.forwardRef<unknown, TransitionRouterViewProps>(
  (props, ref) => {
    let {
      name,
      transition = 'slide',
      transitionPrefix = 'react-view-router-',
      transitionDuration,
      transitionZIndex = 1000,
      transitionFallback = '',
      routerView,

      router: defaultRouter,
      container,
      containerStyle,

      getContainerRef,

      ...restProps
    } = props;
    const router = useRouter(defaultRouter)!;
    const [$refs] = useState(() => ({ container: null as HTMLElement | null }));
    const setContainerRef = useCallback((node: HTMLElement | null) => { $refs.container = node; }, [$refs]);
    const getTransitionContainer = useCallback(() => $refs.container, [$refs]);

    if ((routerView as unknown) === RouterViewTransition) routerView = undefined;

    const suppliedContainerStyle = containerStyle;
    const transitionContainerStyle = isPlainObject(transition) ? transition.containerStyle : null;
    containerStyle = useMemo(
      () => Object.assign({ height: '100%' }, suppliedContainerStyle, transitionContainerStyle),
      [suppliedContainerStyle, transitionContainerStyle]
    );
    const backgroundColor = containerStyle.backgroundColor;
    let containerTag: React.ElementType = 'div';
    if (isPlainObject(transition)) {
      transitionZIndex = transition.zIndex || transitionZIndex;
      containerTag = (transition.containerTag || containerTag) as React.ElementType;
      transition = transition.name || 'slide';
    }

    const transitionMap = useMemo(() => {
      const isSlideNode = (node: HTMLElement) => node && node.className.includes(transitionPrefix + 'slide');
      const isOpacityNode = (node: HTMLElement) => node && ['fade', 'zoom'].some((name) => node.className.includes(transitionPrefix + name));
      const duration = typeof transitionDuration === 'number'
        && isFinite(transitionDuration) && transitionDuration >= 0
        ? transitionDuration : DEFAULT_TRANSITION_MS;
      const prepareSlideNode = (node: HTMLElement) => {
        if (!isSlideNode(node)) return;
        if (transitionZIndex && transitionZIndex !== 1000) node.style.zIndex = String(transitionZIndex);
        const color = getViewBackgroundColor(node, backgroundColor);
        if (color) node.style.backgroundColor = color;
      };
      const restoreSlideNode = (node: HTMLElement) => {
        if (!isSlideNode(node)) return;
        if (transitionZIndex && transitionZIndex !== 1000) node.style.zIndex = '';
        node.style.backgroundColor = '';
      };

      const transitionProps: TransitionCallbacks = {
        timeout: transition === 'none' ? 0 : duration,
        getTimings: (classNames) => (classNames === `${transitionPrefix}fade-through`
          ? { enterDelay: duration * 0.4, exitDuration: duration * 0.4 } : {}),
        addEndListener: (node: HTMLElement, done: () => void) => {
          const to = router.currentRoute;
          if ((!isOpacityNode(node) && isReplace(to, router.prevRoute))
            || (isSlideNode(node) && (node.className.includes('slide-right-enter')
              || node.className.includes('slide-left-exit')
              || /slide-(?:up|down)-back-enter/.test(node.className)
              || /slide-(?:up|down)-exit/.test(node.className)))) {
            return done();
          }
          /**
           * 仅监听目标属性的 transitionend，避免 iOS 上多余事件导致状态机异常。
           */
          const handleEnd = (e: TransitionEvent) => {
            if (e.target !== node || !isTransitionEndEvent(e)) return;
            node.removeEventListener('transitionend', handleEnd);
            done();
          };
          node.addEventListener('transitionend', handleEnd, false);
        },
        onEnter: prepareSlideNode,
        onEntered: restoreSlideNode,
        onExitSnapshot: prepareSlideNode,
        onExited: (maybeNode: HTMLElement) => {
          // if (maybeNode) {
          //   maybeNode.childNodes.forEach(node => {
          //     if (!node[KEEP_ALIVE_REPLACER]
          //       || node.$refs.mountRoot !== maybeNode) return;
          //     node.unmountView();
          //   })
          // }
          restoreSlideNode(maybeNode);
        },
      };
      const forwardNames: Record<string, string> = {
        slide: 'slide-left', carousel: 'carousel-left', 'fade-slide': 'fade-slide-left', zoom: 'zoom-in',
      };
      const directional = (forward: string, back: string, mode = 'together'): PresenterOptions['transitionMap'] => ({
        mode,
        props: {
          classNames: () => {
            const to = router.currentRoute;
            let name = isPush(to) ? forward : isPop(to, router.prevRoute) ? back : '';
            if (!name) {
              const fallback = isFunction(transitionFallback) ? transitionFallback(to!) : transitionFallback;
              name = forwardNames[fallback] || fallback;
            }
            if (name === 'none') return '';
            return name ? `${transitionPrefix}${name}` : name;
          },
        },
      });
      const map: Record<string, PresenterOptions['transitionMap']> = {
        none: { mode: 'out-in', props: {} },
        fade: { mode: 'out-in', props: { classNames: `${transitionPrefix}fade` } },
        slide: directional('slide-left', 'slide-right', 'in-out'),
        carousel: directional('carousel-left', 'carousel-right'),
        'slide-up': directional('slide-up', 'slide-up-back', 'in-out'),
        'slide-down': directional('slide-down', 'slide-down-back', 'in-out'),
        'fade-slide': directional('fade-slide-left', 'fade-slide-right'),
        zoom: directional('zoom-in', 'zoom-out'),
        'fade-through': { mode: 'out-in', props: { classNames: `${transitionPrefix}fade-through` } },
      };
      const transitionItem = map[transition];
      if (transitionItem) Object.assign(transitionItem.props, transitionProps);

      return transitionItem || { mode: 'none', props: {} };
    }, [
      router,
      transitionFallback, transition, transitionPrefix, transitionDuration, transitionZIndex, backgroundColor
    ]);

    const presenterOptions = useMemo(
      () => ({ transitionMap, containerTag, containerStyle, setContainerRef }),
      [transitionMap, containerTag, containerStyle, setContainerRef]
    );

    return React.createElement(TransitionPresenterContext.Provider, {
      value: presenterOptions
    }, React.createElement((routerView || RouterViewOrigin) as React.ElementType, {
      ref,
      name,
      router: defaultRouter,
      container,
      viewPresenter: TransitionPresenter,
      getContainerRef: getContainerRef || getTransitionContainer,
      ...restProps
    }));
  }
);

export {
  SAVED_POSITION_KEY
};

export default RouterViewTransition;
