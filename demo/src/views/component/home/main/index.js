import React from 'react';
import { RouterView, withRouteGuards } from 'react-view-router';
import { RouterLink } from 'router';

function HomeMainIndex() {
  return (
    <div style={{ border: '1px solid green', padding: 10 }}>
      <h1>HomeMainIndex</h1>
      <div className="nav">
        <RouterLink to="some" append>some</RouterLink>
        &nbsp;
        <RouterLink to="other" append>other</RouterLink>
      </div>
      <RouterView />
      <RouterView name="footer" />
    </div>
  );
}

export default withRouteGuards(HomeMainIndex, {
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
