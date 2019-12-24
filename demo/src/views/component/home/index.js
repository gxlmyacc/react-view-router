import React from 'react';
import { RouterView, useRouteGuards } from 'react-view-router';

function HomeIndex() {
  return (
    <div>
      <h1>HomeIndex</h1>
      <RouterView />
    </div>
  );
}

export default useRouteGuards(HomeIndex, {
  beforeRouteEnter(to, from, next) {
    console.log('HomeIndex beforeRouteEnter', to, from);
    next();
  },
  beforeRouteLeave(to, from, next) {
    // confirm leave prompt
    console.log('HomeIndex beforeRouteLeave', this, to, from);
    next();
  },
  beforeRouteUpdate(to, from) {
    console.log('HomeIndex beforeRouteUpdate', to, from);
  },
  afterRouteLeave(to, from) {
    console.log('HomeIndex afterRouteLeave', to, from);
  },
});
