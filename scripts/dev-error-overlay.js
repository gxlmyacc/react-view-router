'use strict';

// CRA's iframe overlay can remain transparent when its iframe script fails to
// initialize. Keep development errors visible in the host document instead.
let buildError = null;
let runtimeError = null;
let onError = null;
let panel = null;
let listening = false;

function messageOf(value) {
  if (value && value.stack) return String(value.stack);
  if (value && value.message) return String(value.message);
  return String(value || 'Unknown error');
}

function render() {
  const message = buildError || runtimeError;
  if (!message) {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    return;
  }
  if (!document.body) return;
  if (!panel) {
    panel = document.createElement('div');
    panel.setAttribute('role', 'alertdialog');
    panel.setAttribute('aria-label', 'Development error');
    panel.setAttribute('data-demo-error-overlay', 'true');
    Object.assign(panel.style, {
      position: 'fixed', top: '0', right: '0', bottom: '0', left: '0',
      zIndex: '2147483647', boxSizing: 'border-box',
      padding: '24px', overflow: 'auto', background: 'rgba(12, 22, 18, .94)',
      color: '#fff', fontFamily: 'Consolas, Menlo, monospace',
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close error panel ×';
    close.setAttribute('aria-label', 'Close development error');
    Object.assign(close.style, {
      float: 'right', padding: '7px 12px', border: '1px solid #fff', borderRadius: '5px',
      background: 'transparent', color: '#fff', cursor: 'pointer',
    });
    close.onclick = function () {
      buildError = null;
      runtimeError = null;
      render();
    };
    const heading = document.createElement('h2');
    heading.style.color = '#ff9180';
    const detail = document.createElement('pre');
    Object.assign(detail.style, { whiteSpace: 'pre-wrap', overflowWrap: 'break-word', lineHeight: '1.5' });
    panel.appendChild(close);
    panel.appendChild(heading);
    panel.appendChild(detail);
    document.body.appendChild(panel);
  }
  panel.querySelector('h2').textContent = buildError ? 'Failed to compile' : 'Runtime error';
  panel.querySelector('pre').textContent = message;
}

function handleError(event) {
  runtimeError = messageOf(event.error || event.reason || event.message);
  if (onError) onError(event);
  render();
}

module.exports = {
  setEditorHandler: function () {},
  startReportingRuntimeErrors: function (options) {
    onError = options && options.onError;
    if (listening) return;
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    listening = true;
  },
  stopReportingRuntimeErrors: function () {
    if (!listening) return;
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleError);
    listening = false;
  },
  reportBuildError: function (error) { buildError = messageOf(error); render(); },
  dismissBuildError: function () { buildError = null; render(); },
  dismissRuntimeErrors: function () { runtimeError = null; render(); },
};
