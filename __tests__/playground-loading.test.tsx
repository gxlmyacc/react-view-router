import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PlaygroundPage from '../demo_react_shared/src/playground/PlaygroundPage';
import { PLAYGROUND_COMPILED, PLAYGROUND_RESULT } from '../demo_react_shared/src/playground/protocol';

jest.mock('react-view-router', () => ({ useRoute: () => undefined }));

it('shows loading through compilation and preview execution, then restores controls on success or failure', () => {
  const previousWorker = window.Worker;
  let receive: (event: { data: unknown }) => void;
  const postMessage = jest.fn();
  window.Worker = jest.fn().mockImplementation(() => ({
    postMessage,
    addEventListener: (_type: string, callback: typeof receive) => { receive = callback; },
    terminate: jest.fn(),
  }));
  const view = render(<PlaygroundPage />);
  try {
    const run = screen.getByRole('button', { name: 'Run', exact: true });
    const reset = screen.getByRole('button', { name: 'Reset', exact: true });
    const frame = view.container.querySelector('iframe')!;
    const channel = new URLSearchParams(frame.src.split('?')[1]).get('channel');
    for (const ok of [true, false]) {
      fireEvent.click(run);
      expect(run).toBeDisabled();
      expect(reset).toBeDisabled();
      expect(run).toHaveAttribute('aria-busy', 'true');
      expect(view.container.querySelector('.playground-loading')).toBeTruthy();
      fireEvent.click(run);
      expect(postMessage).toHaveBeenCalledTimes(ok ? 1 : 2);
      const request = postMessage.mock.calls[postMessage.mock.calls.length - 1][0];
      const handleCompiled = receive!;
      act(() => handleCompiled({
        data: {
          type: PLAYGROUND_COMPILED, id: request.id, diagnostics: [], code: '', css: '',
        },
      }));
      expect(run).toBeDisabled();
      act(() => window.dispatchEvent(new MessageEvent('message', {
        source: frame.contentWindow,
        data: { type: PLAYGROUND_RESULT, channel, ok, error: 'Preview failed' },
      })));
      expect(run).not.toBeDisabled();
      expect(reset).not.toBeDisabled();
      expect(view.container.querySelector('.playground-loading')).toBeNull();
    }
    expect(screen.getByText('Preview failed')).toBeTruthy();
  } finally {
    view.unmount();
    window.Worker = previousWorker;
  }
});
