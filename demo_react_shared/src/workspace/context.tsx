import React, { createContext, useContext } from 'react';
import { createTranslator } from './i18n';
import type { Locale, Translator } from './i18n';
import type { DemoStore } from '../examples/route-guards/runtime';

export interface DemoRuntime {
  store: DemoStore;
  locale: Locale;
  t: Translator;
  setLocale?: (locale: Locale) => void;
}

interface DemoRuntimeProviderProps {
  store: DemoStore;
  locale?: Locale;
  setLocale?: (locale: Locale) => void;
  children?: React.ReactNode;
}

const DemoRuntimeContext = createContext<DemoRuntime>({
  store: { loggedIn: false },
  locale: 'en',
  t: createTranslator('en'),
});

export function DemoRuntimeProvider({
  store,
  locale = 'en',
  setLocale,
  children,
}: DemoRuntimeProviderProps): React.ReactElement {
  return (
    <DemoRuntimeContext.Provider value={{ store, locale, t: createTranslator(locale), setLocale }}>
      {children}
    </DemoRuntimeContext.Provider>
  );
}

export function useDemoRuntime(): DemoRuntime {
  return useContext(DemoRuntimeContext);
}
