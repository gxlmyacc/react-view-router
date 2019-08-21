import ReactDOM from 'react-dom';
import React from 'react';
import router from 'router';
import App from 'component/app';

import routes from './pages';

module.exports = function (param) {
  router.use({ routes });

  router.beforeEach((to, from, next) => {
    if (to) {
      console.log(
        '%croute changed',
        'background-color:#ccc;color:green;font-weight:bold;font-size:14px;',
        to.url, to.query, to.meta, to.redirectedFrom
      );
      return next();
    }
  });

  ReactDOM.render(<App />, document.getElementById('root'));
};
