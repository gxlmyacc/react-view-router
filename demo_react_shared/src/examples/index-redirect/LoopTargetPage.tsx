import React from 'react';
import { useDemoRuntime } from '../../workspace/context';

export default function LoopTargetPage(): React.ReactElement {
  const { locale } = useDemoRuntime();
  return <p>{locale === 'zh' ? '已进入 A 页面，本次循环重定向已停止。' : 'Entered page A. Redirects in this navigation have stopped.'}</p>;
}
