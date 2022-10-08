import React from 'react';
import { RouterView, withRouteGuards, RouterLink } from 'react-view-router';

function HomeMainIndex() {
  return (
    <div style={{ border: '1px solid green', padding: 10 }}>
      <h1>HomeMainIndex</h1>
      <div className="nav">
        <RouterLink
          tag="a"
          to="some"
          append
          onRouteActive={() => {
            console.log('%csome actived', 'color: red;font-weight:bold;');
          }}>some</RouterLink>
        &nbsp;
        <RouterLink
          tag="a"
          to="other"
          append
          onRouteActive={() => {
            console.log('%cother actived', 'color: red;font-weight:bold;');
          }}>other</RouterLink>
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
  beforeRouteResolve(to, from) {
    console.log('HomeMainIndex beforeRouteResolve', to, from);
  },
  afterRouteLeave(to, from) {
    console.log('HomeMainIndex afterRouteLeave', to, from);
  },
});
