import { describe, expect, it } from 'vitest';
import { buildHelloMessage } from './hello';

describe('buildHelloMessage', () => {
  it('returns the default hello world message', () => {
    expect(buildHelloMessage()).toBe('Hello, World!');
  });

  it('formats a custom subject', () => {
    expect(buildHelloMessage('VS Code')).toBe('Hello, VS Code!');
  });
});
