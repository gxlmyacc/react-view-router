import { compile } from 'sass';
import path from 'path';

describe('Page effect styles', () => {
  let style: HTMLStyleElement;
  beforeAll(() => {
    style = document.createElement('style');
    style.textContent = compile(path.resolve(__dirname, '../../transition/src/RouterView.scss')).css;
    document.head.appendChild(style);
  });
  afterAll(() => style.remove());

  it.each([
    ['up', '-100%'],
    ['down', '100%'],
  ])('slide-%s offsets the entering page and reverses the covering page on POP', (direction, offset) => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    try {
      const prefix = `react-view-router-slide-${direction}`;
      node.className = `${prefix}-enter`;
      expect(getComputedStyle(node).transform).toBe(`translate3d(0, ${offset}, 0)`);
      // Initial positioning must not itself start a CSS transition.
      expect(getComputedStyle(node).transition).toBe('');
      node.classList.add(`${prefix}-enter-active`);
      expect(getComputedStyle(node).transform).toBe('translate3d(0, 0, 0)');
      expect(getComputedStyle(node).transition).toContain('transform');
      node.className = `${prefix}-back-exit`;
      expect(getComputedStyle(node).transform).toBe('translate3d(0, 0, 0)');
      node.classList.add(`${prefix}-back-exit-active`);
      expect(getComputedStyle(node).transform).toBe(`translate3d(0, ${offset}, 0)`);
    } finally {
      node.remove();
    }
  });
});
