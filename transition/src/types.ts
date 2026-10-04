import type React from 'react';

export interface TransitionCallbacks {
  timeout?: number;
  getTimings?: (classNames: string) => { enterDelay?: number; exitDuration?: number };
  classNames?: string | (() => string);
  addEndListener?: (node: HTMLElement, done: () => void) => void;
  onEnter?: (node: HTMLElement) => void;
  onEntering?: (node: HTMLElement) => void;
  onEntered?: (node: HTMLElement) => void;
  onExit?: (node: HTMLElement) => void;
  onExitSnapshot?: (node: HTMLElement) => void;
  onExited?: (node: HTMLElement) => void;
}

export interface PresenterOptions {
  setContainerRef?: (node: HTMLElement | null) => void;
  transitionMap: { mode: string; props: TransitionCallbacks };
  containerTag: React.ElementType;
  containerStyle: React.CSSProperties;
}

export interface TransitionPresenterProps extends PresenterOptions {
  children?: React.ReactNode;
  route?: { path: string } | null;
}
