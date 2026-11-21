/**
 * AI DISCLOSURE (CS3704 AI Policy)
 * Generated with Claude (Anthropic).
 * Prompt: I asked Claude for a quick feature idea, chose the verification code
 * check, and asked it to write isValidCode, the App.tsx changes, and these tests.
 * Reviewed and run by me; all tests pass with `npm test`.
 * Function under test: isValidCode in validateCode.ts.
 */
import { isValidCode } from '../src/utils/validateCode';

test('accepts exactly 6 digits, including leading zeros', () => {
  expect(isValidCode('401906')).toBe(true);
  expect(isValidCode('000000')).toBe(true);
});

test('rejects codes that are too short, too long, or empty', () => {
  expect(isValidCode('')).toBe(false);
  expect(isValidCode('123')).toBe(false);
  expect(isValidCode('12345')).toBe(false);
  expect(isValidCode('1234567')).toBe(false);
});

test('rejects letters, spaces, and symbols', () => {
  expect(isValidCode('12a456')).toBe(false);
  expect(isValidCode('12 456')).toBe(false);
  expect(isValidCode('12-456')).toBe(false);
});
