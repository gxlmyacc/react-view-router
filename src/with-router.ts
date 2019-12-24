import React from 'react';
import { getParentRoute } from './util';
import { MatchedRoute } from './globals';

export default function withRouter(comp: React.FunctionComponent | React.ComponentClass) {
  return React.forwardRef((props, ref: any) => {
    class WithRouter extends React.Component<any, {
      inited: boolean,
      route: MatchedRoute | null
    }> {

      constructor(props: any) {
        super(props);
        this.state = { inited: false, route: null };
      }

      componentDidMount() {
        let route = getParentRoute(this);
        this.setState({ inited: true, route });
      }

      render() {
        if (!this.state.inited) return null;
        return React.createElement(
          comp,
          {
            ...props,
            ref,
            route: this.state.route
          } as any,
          props.children
        );
      }

    }
    return React.createElement(WithRouter, {});
  });
}
