import React from 'react';
import router from 'router';
import { RouterView, RouterLink } from 'react-view-router';
import './index.css';

export default function App() {
  return (<div style={{ border: '1px solid black', padding: 10 }}>
    <h1>App</h1>
    <RouterLink router={router} to="/home/main/some">goto /home/main/some</RouterLink>
    <RouterView router={router} />
  </div>);
}
