import React from 'react';
import router from 'router';
import { withRouteGuards } from 'react-view-router';

class HomeMainOtherIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainOtherIndex constructor');
  }

  goSome = () => {
    router.push({
      path: 'some',
      query: { aa: 1 }
    }, () => {
      console.log('router.push some is complete!');
    }, () => {
      console.log('router.push some is abort!');
    });
  };

  render() {
    const { text } = this.state;
    return (
      <div style={{ border: '1px solid yellow', padding: 10 }}>
        <h1>HomeMainOtherIndex</h1>
        { text }
        <button onClick={this.goSome}>to some</button> - router.push('some')
      </div>
    );
  }
}

export default withRouteGuards(
  // component
  HomeMainOtherIndex,
  // route guards
  {
    beforeRouteEnter(to, from, next) {
      console.log('HomeMainOtherIndex beforeRouteEnter', to, from);
      next(vm => {
        console.log('HomeMainOtherIndex beforeRouteEnter next', vm, to, from);
      });
    },
    beforeRouteLeave(to, from, next) {
      // confirm leave prompt
      console.log('HomeMainOtherIndex beforeRouteLeave', this, to, from);
      next();
    },
    beforeRouteResolve(to, from) {
      console.log('HomeMainOtherIndex beforeRouteResolve', this, to, from);
    },
    beforeRouteUpdate(to, from) {
      console.log('HomeMainOtherIndex beforeRouteUpdate', this, to, from);
    },
    afterRouteLeave(to, from) {
      console.log('HomeMainOtherIndex afterRouteLeave', this, to, from);
    },
  }
);
