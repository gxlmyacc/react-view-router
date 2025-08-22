import React from 'react';
import PropTypes from 'prop-types';
import {
  camelize,
  normalizeLocation,
  getHostRouterView,
  isPropChanged
} from './util';
import ReactViewRouter from './router';
import { Route } from './types';
import { RouterViewComponent } from './router-view';

function guardEvent(e: any) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return;
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return;
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true;
}

interface RouterLinkProps {
  router?: ReactViewRouter,

  tag: string,
  event: string | string[],
  activeClass: string,
  exactActiveClass: string,
  to: string | { path: string },

  exact?: boolean,
  replace?: boolean,
  append?: boolean,
  disabled?: boolean

  children: React.ReactNode[],

  className?: string;

  onRouteChange?: (route: Route, routerLinkInstance: RouterLink) => void;
  onRouteActive?: (route: Route, routerLinkInstance: RouterLink) => void;
  onRouteInactive?: (route: Route, routerLinkInstance: RouterLink) => void;


  href?: string;
  [key: string]: any;
}

interface RouterLinkState {
  inited: boolean;
  routerView: RouterViewComponent|null;
  router?: ReactViewRouter,
  seed: number,
  isMatched: boolean
}

let routerLinkSeed = 0;

class RouterLink extends React.Component<RouterLinkProps, RouterLinkState> {

  static propTypes: any;

  static defaultProps: {
    tag: string,
    activeClass: string,
    exactActiveClass: string,
    event: string|string[],
  };

  private unplugin?: (() => void);

  constructor(props: RouterLinkProps) {
    super(props);
    const router = props.router;
    this.state = {
      inited: false,
      router,
      routerView: null,
      seed: routerLinkSeed++,
      isMatched: false
    };
  }

  _remount() {
    const { seed } = this.state;
    let { router } = this.state;

    if (this.unplugin) {
      this.unplugin();
      this.unplugin = undefined;
    }

    const routerView = router ? router.viewRoot : getHostRouterView(this);
    if (!router && routerView) router = routerView.state.router;

    this.unplugin = router
      ? router.plugin({
        name: `router-link-plugin-${seed}`,
        onRouteChange: (currentRoute: Route) => {
          const { isMatched: isMatchedOld } = this.state;
          const { onRouteChange, onRouteActive, onRouteInactive } = this.props;
          const isMatched = this.isMatched(currentRoute);
          this.setState({ isMatched });
          if (isMatched !== isMatchedOld) {
            if (isMatched) onRouteActive && onRouteActive(currentRoute, this);
            else onRouteInactive && onRouteInactive(currentRoute, this);
          }
          if (onRouteChange) onRouteChange(currentRoute, this);
        }
      })
      : undefined;

    const { onRouteActive } = this.props;

    const isMatched = Boolean(router && this.isMatched(router.currentRoute, routerView));
    if (router && isMatched) onRouteActive && onRouteActive(router.currentRoute as any, this);

    const state = {
      inited: true,
      router,
      routerView,
      isMatched
    };

    this.setState(state);
  }

  getFallbackClassName(isMatched: boolean) {
    const { exact } = this.props;
    let { activeClass, exactActiveClass } = this.props;
    const { router } = this.state;

    if (router) {
      if (router.linkActiveClass) {
        activeClass = activeClass ? `${activeClass} ${router.linkActiveClass}` : router.linkActiveClass;
      }
      if (router.linkExactActiveClass) {
        exactActiveClass = exactActiveClass ? `${exactActiveClass} ${router.linkExactActiveClass}` : router.linkExactActiveClass;
      }
    }

    let fallbackClass = '';
    if (isMatched) fallbackClass = exact ? exactActiveClass : activeClass;

    return fallbackClass;
  }

  isMatched(currentRoute: Route|null = null, routerView: RouterViewComponent|null = null) {
    const router = this.state.router;
    if (!currentRoute && router) currentRoute = router.currentRoute;
    if (!currentRoute) return false;
    const { exact, append } = this.props;
    let { to } = this.props;
    if (!routerView) routerView = this.state.routerView;
    to = normalizeLocation(
      to,
      {
        route: routerView ? routerView.state.currentRoute : null,
        append,
        queryProps: router && router.queryProps
      }
    ) as { path: string };
    let isMatched = false;
    if (to && currentRoute) {
      isMatched = exact
        ? to.path === currentRoute.path
        : currentRoute.path.startsWith(to.path);
    }
    return isMatched;
  }

  componentDidMount() {
    this._remount();
  }

  componentWillUnmount() {
    if (this.unplugin) {
      this.unplugin();
      this.unplugin = undefined;
    }
  }

  shouldComponentUpdate(nextProps: RouterLinkProps, nextState: RouterLinkState) {
    if (isPropChanged(this.props, nextProps)) return true;
    if (this.state.inited !== nextState.inited) return true;
    if (this.state.isMatched !== nextState.isMatched) return true;
    return false;
  }

  componentDidUpdate(prevProps: RouterLinkProps) {
    const newState: Partial<any> = {};
    if (this.props.router !== prevProps.router) newState.router = this.props.router;
    // if (this.props.to !== prevProps.to) {
    //   if (!isPlainObject(this.props.to) || !isPlainObject(prevProps.to)
    //     || isPropChanged(this.props.to, prevProps.to)) {
    //     newState.to = this.props.to;
    //   }
    // }
    if (Object.keys(newState).length) {
      this.setState(newState as any, () => this._remount());
    }
  }

  render() {
    if (!this.state.inited) return null;
    if (!this.props.tag) return this.props.children;
    let {
      // eslint-disable-next-line no-unused-vars, prefer-const
      router: router1, onRouteActive, onRouteInactive, onRouteChange, exact, activeClass, exactActiveClass,
      // eslint-disable-next-line prefer-const
      tag, to, replace, append, event,
      // eslint-disable-next-line prefer-const
      children = [], ...remainProps
    } = this.props;
    const { router, isMatched, routerView } = this.state;

    const events: { [key: string]: (e: any) => void; } = {};

    to = normalizeLocation(
      to,
      {
        route: routerView ? routerView.state.currentRoute : null,
        append,
        queryProps: router && router.queryProps
      }
    ) as { path: string };

    const fallbackClass = this.getFallbackClassName(isMatched);
    if (fallbackClass) {
      if (remainProps.className) remainProps.className = `${fallbackClass} ${remainProps.className}`;
      else remainProps.className = fallbackClass;
    }

    if (!Array.isArray(event)) event = event ? [event] : [];

    event.forEach(evt => {
      if (!evt) return;
      const eventName = evt.startsWith('on') ? evt : camelize(`on-${evt}`);
      events[eventName] = (e: any) => {
        if (!to || !router || remainProps.disabled) return;
        if (remainProps[eventName] && remainProps[eventName](e, to) === false) return;

        guardEvent(e);
        if (replace) router.replace(to);
        else router.push(to);
      };
    });

    if (to && tag === 'a') remainProps.href = to.path;

    return React.createElement(tag, { ...remainProps, ...events }, children);
  }

}

RouterLink.propTypes = {
  className: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  replace: PropTypes.bool,
  append: PropTypes.bool,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  activeClass: PropTypes.string,
  exact: PropTypes.bool,
  disabled: PropTypes.bool,
  exactActiveClass: PropTypes.string,
  event: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  onRouteChange: PropTypes.func,
  onRouteActive: PropTypes.func,
  onRouteInactive: PropTypes.func,
};

RouterLink.defaultProps = {
  tag: '',
  activeClass: 'router-link-active',
  exactActiveClass: 'exact-active-class',
  event: 'click'
};

export {
  RouterLinkProps,
  RouterLink,
  guardEvent
};

export default function createRouterLink(router: ReactViewRouter) {
  return React.forwardRef<RouterLink, RouterLinkProps>(
    (props, ref) =>
      React.createElement(RouterLink, { router, ...props, ref }, props.children)
  );
}
