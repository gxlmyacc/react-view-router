import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from 'react-view-router-react-demo-shared';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Cannot find the #root element.');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
