import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const rootElement = document.getElementById('root');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
