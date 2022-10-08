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
    beforeRouteLeave(to, from, next) {
      // confirm leave prompt
      console.log('HomeMainSomeFooter beforeRouteLeave', this, to, from);
      next();
    },
    beforeRouteResolve(to, from) {
      console.log('HomeMainSomeFooter beforeRouteResolve', this, to, from);
    },
    beforeRouteUpdate(to, from) {
      console.log('HomeMainSomeFooter beforeRouteUpdate', this, to, from);
    },
    afterRouteLeave(to, from) {
      console.log('HomeMainSomeFooter afterRouteLeave', this, to, from);
    },
  }
);
