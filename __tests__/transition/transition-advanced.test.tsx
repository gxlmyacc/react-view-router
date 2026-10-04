import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SwitchTransition, { modes } from '../../transition/src/SwitchTransition';
import CSSTransition from '../../transition/src/CSSTransition';
import { SAVED_POSITION_KEY } from '../../transition/src/RouterView';

describe('SwitchTransition 扩展模式', () => {
  it('together 模式切换后应包含新内容', async () => {
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
          { mode: modes.together },
          React.createElement(
            CSSTransition,
            {
              key,
              classNames: 'fade',
              timeout: 0,
              addEndListener: (_n: HTMLElement, done: () => void) => done(),
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
    const nodes = screen.getAllByTestId('child');
    expect(nodes.some(node => node.textContent === 'b')).toBe(true);
  });

  it('相同 key 的子节点不应触发 EXITING', () => {
    const { rerender } = render(
      React.createElement(
        SwitchTransition,
        { mode: modes.out },
        React.createElement(
          CSSTransition,
          {
            key: 'same',
            classNames: 'fade',
            timeout: 0,
            addEndListener: (_n: HTMLElement, done: () => void) => done(),
          },
          React.createElement('div', { 'data-testid': 'same' }, 'a'),
        ),
      ),
    );
    rerender(
      React.createElement(
        SwitchTransition,
        { mode: modes.out },
        React.createElement(
          CSSTransition,
          {
            key: 'same',
            classNames: 'fade',
            timeout: 0,
            addEndListener: (_n: HTMLElement, done: () => void) => done(),
          },
          React.createElement('div', { 'data-testid': 'same' }, 'b'),
        ),
      ),
    );
    expect(screen.getByTestId('same').textContent).toBe('b');
  });
});

describe('transition 模块导出', () => {
  it('应导出 SAVED_POSITION_KEY', () => {
    expect(SAVED_POSITION_KEY).toBe('_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_');
  });

  it('index.js 应导出全部过渡组件', () => {
    const mod = require('../../transition/src/index.ts');
    expect(mod.Transition).toBeDefined();
    expect(mod.TransitionGroup).toBeDefined();
    expect(mod.ReplaceTransition).toBeDefined();
    expect(mod.CSSTransition).toBeDefined();
    expect(mod.SwitchTransition).toBeDefined();
    expect(mod.RouterViewTransition).toBeDefined();
    expect(mod.default).toBeDefined();
  });
});
