import ReactViewRouter from 'react-view-router';
import renderUtils from 'react-view-router/dom';

// Both position operations and session storage come from this host adapter.
const router = new ReactViewRouter({ manual: true, renderUtils });

export default router;
