import { guardEvent } from '../src/router-link';

describe('guardEvent', () => {
  const createEvent = (overrides: Record<string, any> = {}) => ({
    metaKey: false,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    defaultPrevented: false,
    button: 0,
    preventDefault: jest.fn(),
    currentTarget: { getAttribute: jest.fn(() => null) },
    ...overrides,
  });

  it('普通左键点击应返回 true 并 preventDefault', () => {
    const e = createEvent();
    expect(guardEvent(e)).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('metaKey 按下时不应导航', () => {
    expect(guardEvent(createEvent({ metaKey: true }))).toBeUndefined();
  });

  it('ctrlKey 按下时不应导航', () => {
    expect(guardEvent(createEvent({ ctrlKey: true }))).toBeUndefined();
  });

  it('altKey 按下时不应导航', () => {
    expect(guardEvent(createEvent({ altKey: true }))).toBeUndefined();
  });

  it('shiftKey 按下时不应导航', () => {
    expect(guardEvent(createEvent({ shiftKey: true }))).toBeUndefined();
  });

  it('defaultPrevented 时不应导航', () => {
    expect(guardEvent(createEvent({ defaultPrevented: true }))).toBeUndefined();
  });

  it('非左键点击时不应导航', () => {
    expect(guardEvent(createEvent({ button: 2 }))).toBeUndefined();
  });

  it('target="_blank" 时不应导航', () => {
    const e = createEvent({
      currentTarget: { getAttribute: jest.fn(() => '_blank') },
    });
    expect(guardEvent(e)).toBeUndefined();
  });

  it('缺少 currentTarget 时仍允许普通导航', () => {
    const e = createEvent({ currentTarget: null });
    expect(guardEvent(e)).toBe(true);
    expect(e.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('缺少 preventDefault 方法时仍返回可导航状态', () => {
    const e = createEvent({ preventDefault: undefined, button: undefined });
    expect(guardEvent(e)).toBe(true);
  });
});
