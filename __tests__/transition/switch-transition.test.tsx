import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SwitchTransition, { modes } from '../../transition/src/SwitchTransition';
import CSSTransition from '../../transition/src/CSSTransition';

describe('SwitchTransition', () => {
  it('应导出 modes 常量', () => {
    expect(modes.out).toBe('out-in');
    expect(modes.in).toBe('in-out');
    expect(modes.together).toBe('together');
    expect(modes.none).toBe('none');
  });

  it('out-in 模式应切换子节点', async () => {
    const Child = ({ label }: { label: string }) =>
      React.createElement('div', { 'data-testid': 'child' }, label);

    function App() {
      const [key, setKey] = React.useState('a');
      return React.createElement(
        React.Fragment,
        null,
        React.createElement('button', {
          type: 'button',
          'data-testid': 'toggle',
          onClick: () => setKey(k => (k === 'a' ? 'b' : 'a')),
        }, 'toggle'),
        React.createElement(
          SwitchTransition,
          { mode: modes.out },
          React.createElement(
            CSSTransition,
            {
              key,
              classNames: 'fade',
              timeout: 0,
              addEndListener: (node: HTMLElement, done: () => void) => done(),
            },
            React.createElement(Child, { label: key }),
          ),
        ),
      );
    }

    render(React.createElement(App));
    expect(screen.getByTestId('child').textContent).toBe('a');
    await act(async () => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('child').textContent).toBe('b');
  });

  it('children 为 null 时应安全渲染', () => {
    const { container } = render(
      React.createElement(SwitchTransition, { mode: modes.none }, null),
    );
    expect(container).toBeTruthy();
  });

  it('in-out 模式应渲染', () => {
    render(
      React.createElement(
        SwitchTransition,
        { mode: modes.in },
        React.createElement(
          CSSTransition,
          {
            key: 'k1',
            classNames: 'fade',
            timeout: 0,
            addEndListener: (_n: HTMLElement, done: () => void) => done(),
          },
          React.createElement('div', { 'data-testid': 'in-out' }, 'x'),
        ),
      ),
    );
    expect(screen.getByTestId('in-out')).toBeTruthy();
  });
});

describe('transition/index 导出', () => {
  it('应导出 RouterViewTransition 与过渡组件', () => {
    const mod = require('../../transition/src/index.ts');
    expect(mod.default).toBeDefined();
    expect(mod.CSSTransition).toBeDefined();
    expect(mod.SwitchTransition).toBeDefined();
    expect(mod.RouterViewTransition).toBeDefined();
  });
});
