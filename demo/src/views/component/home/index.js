import React from 'react';
import { RouterView, withRouteGuards } from 'react-view-router';

function HomeIndex() {
  return (
    <div style={{ border: '1px solid red', padding: 10 }}>
      <h1>HomeIndex</h1>
      <RouterView />
    </div>
  );
}

export default withRouteGuards(HomeIndex, {
  beforeRouteEnter(to, from, next) {
    console.log('HomeIndex beforeRouteEnter', to, from);
    next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    console.log('HomeIndex beforeRouteLeave', this, to, from);
    next();
  },
  beforeRouteResolve(to, from) {
    console.log('HomeIndex beforeRouteResolve', to, from);
  },
  beforeRouteUpdate(to, from) {
    console.log('HomeIndex beforeRouteUpdate', to, from);
  },
  afterRouteLeave(to, from) {
    console.log('HomeIndex afterRouteLeave', to, from);
  },
});
