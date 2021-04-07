import React from 'react';
import PropTypes from 'prop-types';
import {
  camelize,
  normalizeLocation,
  isRouteChanged,
  getHostRouterView
} from './util';
import ReactViewRouter from './router';

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
  // this may be a Weex event which doesn't have this method
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
  href?: string;
  onRouteChange?: (route: any) => void;

  [key: string]: any;
}

interface RouterLinkState {
  inited: boolean;
  currentRoute: any;
  parentRoute: any;
  router?: ReactViewRouter,
  seed: number
}

let routerLinkSeed = 0;

class RouterLink extends React.Component<RouterLinkProps, RouterLinkState> {

  static propTypes: any;

  static defaultProps: {
    tag: string,
    activeClass: string,
    exactActiveClass: string,
    event: string,
  };

  private unplugin?: (() => void);

  constructor(props: RouterLinkProps) {
    super(props);
    const router = props.router;
    this.state = {
      inited: false,
      router,
      currentRoute: router ? router.currentRoute : null,
      parentRoute: null,
      seed: routerLinkSeed++,
    };
  }

  _remount() {
    let { router, seed } = this.state;

    if (this.unplugin) {
      this.unplugin();
      this.unplugin = undefined;
    }

    let routerView = getHostRouterView(this);
    if (!router && routerView) router = routerView.state.router;

    this.unplugin = router
      ? router.plugin({
        name: `router-link-plugin-${seed}`,
        onRouteChange: (currentRoute: any) => {
          this.setState({ currentRoute });
          if (this.props.onRouteChange) this.props.onRouteChange(currentRoute);
        }
      })
      : undefined;

    this.setState({
      inited: true,
      router,
      parentRoute: routerView ? routerView.state.currentRoute : null
    });
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
    if (this.props.router !== nextProps.router) return true;
    if (this.props.to !== nextProps.to) return true;
    if (this.props.replace !== nextProps.replace) return true;
    if (this.props.tag !== nextProps.tag) return true;
    if (this.props.activeClass !== nextProps.activeClass) return true;
    if (this.props.exact !== nextProps.exact) return true;
    if (this.props.exactActiveClass !== nextProps.exactActiveClass) return true;
    if (this.props.event !== nextProps.event) return true;
    if (this.state.inited !== nextState.inited) return true;
    if (isRouteChanged(this.state.parentRoute, nextState.parentRoute)) return true;
    if (isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
    return false;
  }

  componentDidUpdate(prevProps: RouterLinkProps) {
    if (this.props.router !== prevProps.router) {
      this.setState({ router: this.props.router }, () => this._remount());
    }
  }

  render() {
    if (!this.state.inited) return null;

    let {
      // eslint-disable-next-line no-unused-vars
      router: router1,
      tag, to, exact, replace, append, event,
      children = [], activeClass, exactActiveClass, ...remainProps
    } = this.props;
    const {
      currentRoute: current = { path: '' },
      router
    } = this.state;

    to = normalizeLocation(to, this.state.parentRoute, { append }) as { path: string };

    if (router && router.linkActiveClass) {
      activeClass = activeClass ? `${activeClass} ${router.linkActiveClass}` : router.linkActiveClass;
    }
    if (router && router.linkExactActiveClass) {
      exactActiveClass = exactActiveClass ? `${exactActiveClass} ${router.linkExactActiveClass}` : router.linkExactActiveClass;
    }

    let fallbackClass = '';
    if (to && current) {
      fallbackClass = exact
        ? to.path === current.path ? exactActiveClass : ''
        : to && current.path.startsWith(to.path) ? activeClass : '';
    }

    if (fallbackClass) {
      if (remainProps.className) remainProps.className = `${fallbackClass} ${remainProps.className}`;
      else remainProps.className = fallbackClass;
    }

    if (!Array.isArray(event)) event = [event];

    const events: { [key: string]: (e: any) => void; } = {};
    event.forEach(evt => {
      events[camelize(`on-${evt}`)] = (e: any) => {
        guardEvent(e);
        if (!to || !router || remainProps.disabled) return;
        if (replace) router.replace(to);
        else router.push(to);
      };
    });

    if (to && tag === 'a') remainProps.href = to.path;

    return React.createElement(tag, Object.assign(remainProps, events), ...children);
  }

}

RouterLink.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  replace: PropTypes.bool,
  append: PropTypes.bool,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  activeClass: PropTypes.string,
  exact: PropTypes.bool,
  exactActiveClass: PropTypes.string,
  event: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  onRouteChange: PropTypes.func
};

RouterLink.defaultProps = {
  tag: 'a',
  activeClass: 'router-link-active',
  exactActiveClass: 'exact-active-class',
  event: 'click'
};

export {
  RouterLink
};

export default function createRouterLink(router: ReactViewRouter) {
  return React.forwardRef<RouterLink, RouterLinkProps>(
    (props, ref) =>
      React.createElement(RouterLink, { router, ...props, ref }, props.children)
  );
}
