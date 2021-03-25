import React from 'react';
import store from 'store';
import router from 'router';

export default function LoginIndex() {
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
