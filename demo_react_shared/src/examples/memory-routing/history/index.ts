import ReactViewRouter, { HistoryType } from 'react-view-router';

export const internalMemoryRouter = new ReactViewRouter({ manual: true });
export const externalHistoryOwner = new ReactViewRouter({
  manual: true,
  mode: HistoryType.memory,
  pathname: '/home',
});
export const externalMemoryHistory = externalHistoryOwner.history;
export const externalMemoryRouter = new ReactViewRouter({ manual: true });
