import React from 'react';
import { useRouteGuards } from 'react-view-router';
import store from 'store';
import router from 'router';

class HomeMainSomeIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainSomeIndex constructor');
  }

  refresh = () => {
    this.setState({ text: 'text1 refreshed' });
  }

  render() {
    const { text } = this.state;
    return (
      <div>
        <h1>HomeMainSomeIndex</h1>
        { text }
        <button onClick={() => router.push('other')}>to other</button>
      </div>
    );
  }
}

function WrapComponent(Comp) {
  return React.forwardRef((props, ref) => (<Comp {...props} ref={ref} />));
}

export default useRouteGuards(
  // component
  WrapComponent(HomeMainSomeIndex),
  // route guards
  {
    beforeRouteEnter(to, from, next) {
      console.log('HomeMainSomeIndex beforeRouteEnter', to, from);
      if (!store.logined) next('/login');
      else next(vm => {
        console.log('HomeMainSomeIndex beforeRouteEnter next', vm, to, from);
        vm.refresh();
      });
    },
    beforeRouteLeave(to, from, next) {
      // confirm leave prompt
      console.log('HomeMainSomeIndex beforeRouteLeave', this, to, from);
      next();
    },
    beforeRouteUpdate(to, from) {
      console.log('HomeMainSomeIndex beforeRouteUpdate', this, to, from);
    },
    afterRouteEnter(to, from) {
      console.log('HomeMainSomeIndex afterRouteEnter', this, to, from);
    },
    afterRouteLeave(to, from) {
      console.log('HomeMainSomeIndex afterRouteLeave', this, to, from);
    },
  },
  // component class, if component is wraped, then need provide this argument
  HomeMainSomeIndex
);
