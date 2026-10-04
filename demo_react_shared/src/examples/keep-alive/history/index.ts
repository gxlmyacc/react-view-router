import ReactViewRouter from 'react-view-router';
import renderUtils from 'react-view-router/dom';

const router = new ReactViewRouter({
  manual: true,
  renderUtils,
  // Enable the cache container; the route opts only /draft into preservation.
  keepAlive: () => false,
});

export default router;
