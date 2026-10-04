import React, { useState } from 'react';
import { useRouteState, useRouter } from 'react-view-router';
import { useDemoRuntime } from '../../workspace/context';
import type { CalculatorState } from './types';

export function CalculatorForm(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  const [left, setLeft] = useState('12');
  const [right, setRight] = useState('30');
  const submit = (): void => {
    const first = Number(left);
    const second = Number(right);
    const state: CalculatorState = {
      left: first, right: second, expression: `${first} + ${second}`, result: first + second,
    };
    if (router) router.push({ path: '/result', state });
  };
  return (
    <section className="calculator-form">
      <h3>{t('calculatorTitle')}</h3>
      <label>{t('firstNumber')}<input value={left} onChange={event => setLeft(event.target.value)} /></label>
      <label>{t('secondNumber')}<input value={right} onChange={event => setRight(event.target.value)} /></label>
      <button type="button" onClick={submit}>{t('calculate')}</button>
    </section>
  );
}

export function CalculatorResult(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  const [state] = useRouteState<CalculatorState>();
  if (!state || typeof state.result !== 'number') {
    return <section><h3>{t('calculatorResult')}</h3><p>{t('calculatorMissing')}</p></section>;
  }
  return (
    <section>
      <h3>{t('calculatorResult')}</h3>
      <dl><dt>{t('expression')}</dt><dd>{state.expression}</dd><dt>{t('result')}</dt><dd>{state.result}</dd></dl>
      <button type="button" onClick={() => router && router.push('/help')}>{t('openCalculatorHelp')}</button>
      <button type="button" onClick={() => router && router.push('/form')}>{t('backToForm')}</button>
    </section>
  );
}

export function CalculatorHelp(): React.ReactElement {
  const router = useRouter();
  const { t } = useDemoRuntime();
  return (
    <section><h3>{t('calculatorHelpTitle')}</h3><p>{t('calculatorHelpText')}</p>
      <button type="button" onClick={() => router && router.back()}>{t('backToResult')}</button>
    </section>
  );
}
