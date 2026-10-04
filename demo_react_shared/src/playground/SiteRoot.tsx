import React, { Suspense, lazy } from 'react';
import PlaygroundRuntime from './PlaygroundRuntime';

const WorkspaceApp = lazy(() => import(/* webpackChunkName: "demo-workspace" */ '../workspace/App'));

export default function SiteRoot(): React.ReactElement {
  if (typeof window !== 'undefined' && window.location.hash.indexOf('#/__playground-runtime') === 0) {
    return <PlaygroundRuntime />;
  }
  return (
    <Suspense fallback={<div />}>
      <WorkspaceApp />
    </Suspense>
  );
}
