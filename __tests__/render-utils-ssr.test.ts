/** @jest-environment node */
import ReactViewRouter, { HistoryType, defaultRenderUtils } from '../src';

jest.mock('react-dom', () => { throw new Error('Core must not load ReactDOM'); });

it('imports core and creates a memory router without accessing document or ReactDOM', () => {
  expect(typeof document).toBe('undefined');
  const router = new ReactViewRouter({ mode: HistoryType.memory });
  expect(router.options.renderUtils).toBe(defaultRenderUtils);
  expect(defaultRenderUtils.storage.getSessionStorage!()).toBeNull();
  expect(defaultRenderUtils.position.getDefaultPositionContainer!()).toBeNull();
  const container = { scrollLeft: 3, scrollTop: 7 } as HTMLElement;
  expect(defaultRenderUtils.position.getPosition!(container)).toEqual({ x: 3, y: 7 });
  router.stop();
});
