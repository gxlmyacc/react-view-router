import React from 'react';
import { useRouteGuards } from 'react-view-router';

class HomeMainSomeFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainSomeFooter constructor');
  }

  render() {
    const { text } = this.state;
    return (
      <div>
        <h1>HomeMainSomeFooter</h1>
        { text }
      </div>
    );
  }
}

export default useRouteGuards(
  // component
  HomeMainSomeFooter,
  // route guards
  {
    beforeRouteEnter(to, from, next) {
      console.log('HomeMainSomeFooter beforeRouteEnter', to, from);
      next(vm => {
        console.log('HomeMainSomeFooter beforeRouteEnter next', vm, to, from);
      });
    },
  }
);
