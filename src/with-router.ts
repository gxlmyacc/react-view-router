import React from 'react';
import { getParentRoute } from './util';

export default function withRouter(comp: React.FunctionComponent | React.ComponentClass) {
  return React.forwardRef((props, ref: any) => {
    class WithRouter extends React.Component {

      state: { inited: boolean, route: any };

      constructor(props: object) {
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
          ...(props.children as React.ReactNode[] || [])
        );
      }

    }
    return React.createElement(WithRouter, {});
  });
}
