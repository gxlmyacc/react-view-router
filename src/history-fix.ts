import { createHashHistory, createBrowserHistory, createMemoryHistory, History, LocationState } from 'history-fix';

interface HistoryFix extends History {
  destroy?: () => void;
}

export {
  createHashHistory,
  createBrowserHistory,
  createMemoryHistory,
  History,
  HistoryFix,
  LocationState
};