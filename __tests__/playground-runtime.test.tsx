import React from 'react';
import { act, render } from '@testing-library/react';
import PlaygroundRuntime from '../demo_react_shared/src/playground/PlaygroundRuntime';
import { PLAYGROUND_RUN } from '../demo_react_shared/src/playground/protocol';

it('mounts each preview revision once and cleans up the previous revision once', () => {
  const view = render(<PlaygroundRuntime />);
  const events: string[] = [];
  (window as any).previewEvents = events;
  const run = () => act(() => {
    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: {
        type: PLAYGROUND_RUN,
        channel: '',
        code: `return function Preview() {
          React.useEffect(function () {
            window.previewEvents.push('mount');
            return function () { window.previewEvents.push('unmount'); };
          }, []);
          return React.createElement('p', null, 'Preview');
        };`,
      },
    }));
  });
  run();
  expect(events).toEqual(['mount']);
  run();
  expect(events).toEqual(['mount', 'unmount', 'mount']);
  view.unmount();
  expect(events).toEqual(['mount', 'unmount', 'mount', 'unmount']);
  delete (window as any).previewEvents;
});
