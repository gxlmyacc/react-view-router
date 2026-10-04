import { parseQuery, stringifyQuery } from '../src/config';

describe('parseQuery', () => {
  it('应解析空查询字符串', () => {
    expect(parseQuery('')).toEqual({});
    expect(parseQuery('?')).toEqual({});
  });

  it('应解析基本键值对', () => {
    expect(parseQuery('?foo=bar&baz=qux')).toEqual({ baz: 'qux', foo: 'bar' });
  });

  it('应将布尔和 null 字符串转为对应类型', () => {
    expect(parseQuery('?a=true&b=false&c=null&d=undefined&e=NaN')).toEqual({
      a: true,
      b: false,
      c: null,
      d: undefined,
      e: NaN,
    });
  });

  it('应解析 JSON 对象和数组', () => {
    expect(parseQuery('?obj={"x":1}')).toEqual({ obj: { x: 1 } });
    expect(parseQuery('?arr=[1,2]')).toEqual({ arr: [1, 2] });
  });

  it('重复键应合并为数组', () => {
    expect(parseQuery('?tag=a&tag=b')).toEqual({ tag: ['a', 'b'] });
  });

  it('应支持自定义解析器', () => {
    const result = parseQuery('?num=42', {
      num: (val: string) => Number(val),
    });
    expect(result.num).toBe(42);
  });

  it('应保留无效 JSON，并隔离自定义解析器异常', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseQuery('?broken={bad}&custom=value', {
      custom: () => { throw new Error('invalid custom value'); },
    })).toEqual({ broken: '{bad}', custom: 'value' });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('应将 + 解码为空格', () => {
    expect(parseQuery('?q=hello+world')).toEqual({ q: 'hello world' });
  });

  it('应处理无值参数、空键和 object-tag 字符串', () => {
    expect(parseQuery('?flag&=value&tag=%5Bobject+Custom%5D', {
      tag: (value) => `parsed:${value}`,
    })).toEqual({
      '': 'value',
      flag: null,
      tag: 'parsed:[object Custom]',
    });
  });
});

describe('stringifyQuery', () => {
  it('空对象应返回空字符串', () => {
    expect(stringifyQuery({})).toBe('');
    expect(stringifyQuery(null)).toBe('');
  });

  it('应序列化基本键值对', () => {
    const result = stringifyQuery({ foo: 'bar', baz: 'qux' });
    expect(result).toBe('?baz=qux&foo=bar');
  });

  it('应处理 null 和 undefined', () => {
    expect(stringifyQuery({ a: null, b: undefined })).toBe('?a');
  });

  it('应序列化数组值', () => {
    const result = stringifyQuery({ tags: ['a', undefined, null, { id: 1 }, 'b'] });
    expect(decodeURIComponent(result)).toBe('?tags=a&tags&tags={"id":1}&tags=b');
  });

  it('应支持自定义前缀并保留逗号', () => {
    expect(stringifyQuery({ value: 'a,b' }, '#')).toBe('#value=a,b');
  });

  it('应序列化对象值', () => {
    const result = stringifyQuery({ data: { x: 1 } });
    expect(result).toContain('data=');
    expect(decodeURIComponent(result!)).toContain('{"x":1}');
  });

  it('应正确编码特殊字符', () => {
    const result = stringifyQuery({ q: "a'b(c)" });
    expect(result).toBe('?q=a%27b%28c%29');
  });

  it('parseQuery 与 stringifyQuery 应互为逆操作', () => {
    const original = { name: 'test', count: '3', flag: true };
    const parsed = parseQuery(stringifyQuery(original));
    expect(parsed).toEqual(original);
  });
});
