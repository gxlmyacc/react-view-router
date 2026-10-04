/** @jest-environment jsdom */

interface DevErrorOverlay {
  startReportingRuntimeErrors(options: { onError: jest.Mock }): void;
  stopReportingRuntimeErrors(): void;
  reportBuildError(message: string): void;
  dismissBuildError(): void;
  dismissRuntimeErrors(): void;
}

describe('demo development error overlay', () => {
  afterEach(() => {
    document.querySelector('[data-demo-error-overlay]')?.remove();
    jest.resetModules();
  });

  it('shows build errors directly and lets the developer close the panel', () => {
    const overlay = require('../scripts/dev-error-overlay') as DevErrorOverlay;
    overlay.reportBuildError('Module not found: Example.tsx');
    const panel = document.querySelector('[data-demo-error-overlay]') as HTMLElement;

    expect(panel.textContent).toContain('Module not found: Example.tsx');
    expect(document.querySelector('iframe')).toBeNull();
    (panel.querySelector('button') as HTMLButtonElement).click();
    expect(document.querySelector('[data-demo-error-overlay]')).toBeNull();
  });

  it('reports runtime errors and removes them after dismissal', () => {
    const overlay = require('../scripts/dev-error-overlay') as DevErrorOverlay;
    const onError = jest.fn();
    overlay.startReportingRuntimeErrors({ onError });
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('Demo failed') }));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-demo-error-overlay]')?.textContent).toContain('Demo failed');
    overlay.dismissRuntimeErrors();
    overlay.stopReportingRuntimeErrors();
    expect(document.querySelector('[data-demo-error-overlay]')).toBeNull();
  });

  it.each(['demo_react16', 'demo_react17', 'demo_react18', 'demo_react19'])(
    'disables the redundant webpack iframe overlay in %s',
    launcher => {
      const override = require(`../${launcher}/config-overrides`);
      const config = override.devServer(() => ({ client: { overlay: { errors: true } } }))();
      expect(config.client.overlay).toBe(false);
    },
  );
});
