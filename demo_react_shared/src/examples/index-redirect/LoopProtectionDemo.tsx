import React, { useEffect, useState } from 'react';
import type { NavigationLoopError } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import './LoopProtectionDemo.scss?scoped';

export default function LoopProtectionDemo(): React.ReactElement {
  const { locale } = useDemoRuntime();
  const [error, setError] = useState<NavigationLoopError | null>(null);
  const [recovered, setRecovered] = useState(false);
  const zh = locale === 'zh';
  useEffect(() => router.onError((value) => {
    if ((value as NavigationLoopError).code === 'NAVIGATION_LOOP_DETECTED') {
      setError(value as NavigationLoopError);
    }
  }), []);
  const trigger = () => {
    setError(null);
    setRecovered(false);
    router.push('/loop-a').catch(() => undefined);
  };
  const recover = () => {
    router.push('/replacement').then(() => setRecovered(true)).catch(() => undefined);
  };
  return (
    <section className="loop-protection-demo">
      <h3>{zh ? '防循环导航保护' : 'Navigation loop protection'}</h3>
      <p>{zh
        ? 'A → B → C → A：同一路径在 1 秒内第 10 次尝试时进入 A 并停止重定向，随后可以立即导航。'
        : 'A → B → C → A: enter A and stop redirects on the tenth attempt within one second. New navigation is immediately available.'}</p>
      <button type="button" onClick={trigger}>{zh ? '触发循环' : 'Trigger loop'}</button>
      <button type="button" onClick={recover}>{zh ? '导航到安全页面' : 'Navigate to safe page'}</button>
      <p role="status">{error ? `${error.code}: ${error.pathname} (${error.maxVisits} / ${error.windowMs}ms)` : '—'}</p>
      {recovered && <p>{zh ? '已恢复导航' : 'Navigation recovered'}</p>}
    </section>
  );
}
