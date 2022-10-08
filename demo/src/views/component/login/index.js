import React from 'react';
import store from 'store';
import router from 'router';
import { withRouteGuards } from 'react-view-router';

function LoginIndex() {
  const doLogin = () => {
    store.logined = true;
    router.push({
      path: '/home',
      query: { aa: 1 }
    }, () => {
      console.log('router.push is complete!');
    }, () => {
      console.log('router.push is abort!');
    });
  };

  return (
    <div style={{ border: '1px solid red', padding: 10 }}>
      <h1>LoginIndex</h1>
      <button onClick={doLogin}>Login</button> - router.push('/home')
    </div>
  );
}

export default withRouteGuards(LoginIndex, {
  beforeRouteEnter(to, from, next) {
    console.log('LoginIndex beforeRouteEnter', to, from);
    next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    console.log('LoginIndex beforeRouteLeave', this, to, from);
    next();
  },
  beforeRouteResolve(to, from) {
    console.log('LoginIndex beforeRouteResolve', this, to, from);
  },
  beforeRouteUpdate(to, from) {
    console.log('LoginIndex beforeRouteUpdate', this, to, from);
  },
  afterRouteLeave(to, from) {
    console.log('LoginIndex afterRouteLeave', this, to, from);
  },
});
