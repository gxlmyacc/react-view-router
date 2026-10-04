import 'core-js/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import App from 'react-view-router-react-demo-shared';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Cannot find the #root element.');

ReactDOM.render(<App />, rootElement);
