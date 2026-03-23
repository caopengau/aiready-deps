import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should merge conflicting Tailwind padding classes', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('px-4', 'px-6')).toBe('px-6');
    expect(cn('py-2', 'py-4')).toBe('py-4');
  });

  it('should merge conflicting Tailwind margin classes', () => {
    expect(cn('m-4', 'm-6')).toBe('m-6');
    expect(cn('mx-4', 'mx-6')).toBe('mx-6');
  });

  it('should merge conflicting Tailwind text color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should merge conflicting Tailwind background classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should preserve non-conflicting classes', () => {
    expect(cn('flex', 'items-center', 'justify-center')).toBe('flex items-center justify-center');
  });

  it('should handle mixed Tailwind and custom classes', () => {
    expect(cn('custom-class', 'p-4', 'another-class')).toBe('custom-class p-4 another-class');
  });
});
