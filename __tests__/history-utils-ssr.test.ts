/** @jest-environment node */

import { CAN_USE_DOM, getBaseHref } from '../src/history/utils';

describe('history/utils SSR', () => {
  it('检测不到 DOM 时 getBaseHref 返回空字符串', () => {
    expect(CAN_USE_DOM).toBe(false);
    expect(getBaseHref()).toBe('');
  });
});
