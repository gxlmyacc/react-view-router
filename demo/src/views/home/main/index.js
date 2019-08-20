import React from 'react';
import { RouterView, useRouteGuards } from 'react-view-router';

function HomeMainIndex() {
  return (
    <div>
      <h1>HomeMainIndex</h1>
      <RouterView />
      <RouterView name="footer" />
    </div>
  );
}

export default useRouteGuards(HomeMainIndex, {
  beforeRouteEnter(to, from, next) {
    console.log('HomeMainIndex beforeRouteEnter', to, from);
    next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    console.log('HomeMainIndex beforeRouteLeave', this, to, from);
    next();
  },
  beforeRouteUpdate(to, from) {
    console.log('HomeMainIndex beforeRouteUpdate', to, from);
  },
  afterRouteEnter(to, from) {
    console.log('HomeMainIndex afterRouteEnter', to, from);
  },
  afterRouteLeave(to, from) {
    console.log('HomeMainIndex afterRouteLeave', to, from);
  },
});
