import React from 'react';
import router from 'router';
import { RouterView } from 'react-view-router';

export default function App() {
  return (<div>
    <h1>App</h1>
    <RouterView router={router} />
  </div>);
}
