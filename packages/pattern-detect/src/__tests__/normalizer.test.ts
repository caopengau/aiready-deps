import { describe, it, expect } from 'vitest';
import { normalizeCode, tokenize } from '../core/normalizer';

describe('normalizeCode', () => {
  it('should return empty string for empty input', () => {
    expect(normalizeCode('')).toBe('');
  });

  it('should normalize strings to STR placeholder', () => {
    const code = 'const msg = "hello world";';
    const result = normalizeCode(code);
    expect(result).toContain('"str"');
    expect(result).not.toContain('hello world');
  });

  it('should normalize numbers to NUM placeholder', () => {
    const code = 'const x = 42;';
    const result = normalizeCode(code);
    expect(result).toContain('num');
    expect(result).not.toContain('42');
  });

  it('should remove single-line comments in JS/TS', () => {
    const code = 'const x = 1; // comment';
    const result = normalizeCode(code);
    expect(result).not.toContain('comment');
    expect(result).toContain('const x = num;');
  });

  it('should remove block comments in JS/TS', () => {
    const code = '/* block comment */ const x = 1;';
    const result = normalizeCode(code);
    expect(result).not.toContain('block comment');
    expect(result).toContain('const x = num;');
  });

  it('should remove Python comments when isPython is true', () => {
    const code = 'x = 1  # python comment';
    const result = normalizeCode(code, true);
    expect(result).not.toContain('python comment');
    expect(result).toContain('x = num');
  });

  it('should collapse whitespace', () => {
    const code = 'const   x   =   1;';
    const result = normalizeCode(code);
    expect(result).toBe('const x = num;');
  });

  it('should convert to lowercase', () => {
    const code = 'const X = 1;';
    const result = normalizeCode(code);
    expect(result).toContain('const x');
  });

  it('should handle template literals', () => {
    const code = 'const msg = `hello ${name}`;';
    const result = normalizeCode(code);
    expect(result).toContain('`str`');
  });

  it('should handle single quotes', () => {
    const code = "const msg = 'hello';";
    const result = normalizeCode(code);
    expect(result).toContain("'str'");
  });
});

describe('tokenize', () => {
  it('should return empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('should filter out tokens shorter than 3 characters', () => {
    const norm = 'ab cd abcde';
    const result = tokenize(norm);
    expect(result).toEqual(['abcde']);
  });

  it('should filter out stopwords', () => {
    const norm = 'const function return myFunction';
    const result = tokenize(norm);
    expect(result).toEqual(['myFunction']);
  });

  it('should remove punctuation', () => {
    const norm = 'foo(bar, baz);';
    const result = tokenize(norm);
    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).toContain('baz');
  });

  it('should handle normalized code with placeholders', () => {
    const norm = 'const x = num; return str;';
    const result = tokenize(norm);
    expect(result).toEqual(['num', 'str']);
  });

  it('should extract meaningful identifiers', () => {
    const norm = 'function calculateTotal(items) { return sum; }';
    const result = tokenize(norm);
    expect(result).toContain('calculateTotal');
    expect(result).toContain('items');
    expect(result).not.toContain('function');
    expect(result).not.toContain('return');
  });

  it('should handle multiple whitespace types', () => {
    const norm = 'foo  bar\tbaz\nqux';
    const result = tokenize(norm);
    expect(result).toEqual(['foo', 'bar', 'baz', 'qux']);
  });
});
