import React from 'react';
import PropTypes from 'prop-types';
import {
  camelize,
  normalizeLocation,
  isRouteChanged,
  getHostRouterView
} from './util';

function guardEvent(e) {
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

export default function createRouterLink(router) {
  class RouterLink extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        inited: false,
        currentRoute: router.currentRoute,
        parentRoute: null
      };
    }

    componentDidMount() {
      this.unplugin = router.plugin({
        name: 'router-link-plugin',
        onRouteChange: currentRoute => {
          this.setState({ currentRoute });
          if (this.props.onRouteChange) this.props.onRouteChange(currentRoute);
        }
      });
      let routerView = getHostRouterView(this);
      this.setState({
        inited: true,
        parentRoute: routerView ? routerView.state.currentRoute : null
      });
    }

    componentWillUnmount() {
      if (this.unplugin) this.unplugin();
    }

    shouldComponentUpdate(nextProps, nextState) {
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

    render() {
      if (!this.state.inited) return null;

      let {
        tag, to, exact, replace, append, event,
        children = [], activeClass, exactActiveClass, ...remainProps
      } = this.props;
      const current = this.state.currentRoute;
      to = normalizeLocation(to, this.state.parentRoute, append);

      if (router.linkActiveClass) activeClass = router.linkActiveClass;
      if (router.linkExactActiveClass) exactActiveClass = router.linkExactActiveClass;

      const fallbackClass = exact
        ? to.path === current.path ? exactActiveClass : ''
        : current.path.startsWith(to.path) ? activeClass : '';

      if (fallbackClass) {
        if (remainProps.className) remainProps.className = `${fallbackClass} ${remainProps.className}`;
        else remainProps.className = fallbackClass;
      }

      if (!Array.isArray(event)) event = [event];
      event.forEach(evt => {
        remainProps[camelize(`on-${evt}`)] = e => {
          guardEvent(e);
          if (replace) router.replace(to);
          else router.push(to);
        };
      });

      if (tag === 'a') remainProps.href = to.path;

      return React.createElement(tag, remainProps, ...children);
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

  return RouterLink;
}
