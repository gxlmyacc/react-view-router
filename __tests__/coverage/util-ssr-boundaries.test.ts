/** @jest-environment node */
import { getSessionStorage, setSessionStorage, getCurrentPageHash } from '../../src/util';

describe('SSR utility 环境能力', () => {
  it('无 sessionStorage 或 location 时读取返回空值且写入不抛错', () => {
    expect(getSessionStorage('absent')).toBeNull();
    expect(getSessionStorage('absent', true)).toBeNull();
    expect(() => setSessionStorage('absent', { value: 1 })).not.toThrow();
    expect(getCurrentPageHash('https://example.test/#/page')).toBe('');
  });
});
