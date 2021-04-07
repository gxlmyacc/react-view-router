import React from 'react';
import { withRouteGuards } from 'react-view-router';

class HomeMainSomeFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainSomeFooter constructor');
  }

  render() {
    const { text } = this.state;
    return (
      <div style={{ border: '1px solid blue', padding: 10, marginTop: 10 }}>
        <h1>HomeMainSomeFooter</h1>
        { text }
      </div>
    );
  }
}

export default withRouteGuards(
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
