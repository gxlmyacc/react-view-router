import React from 'react';
import { getParentRoute } from './util';

export default function withRouter(comp) {
  return React.forwardRef((props, ref) => {
    class WithRouter extends React.Component {

      constructor(props) {
        super(props);
        this.state = { inited: false, route: null };
      }

      componentDidMount() {
        let route = getParentRoute(this);
        this.setState({ inited: true, route });
      }

      render() {
        if (!this.state.inited) return null;
        return React.createElement(comp, { ...props, ref, route: this.state.route }, ...(props.children || []));
      }

    }
    return React.createElement(WithRouter, {});
  });
}
