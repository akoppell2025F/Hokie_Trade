/**
 * AI DISCLOSURE (CS3704 AI Policy)
 * These tests were generated with Claude (Anthropic) on 2026-10-23.
 * Prompt used: "write a unit test for the VT email validation (isVtEmail)
 * in my Expo/React Native project", then simplified to a minimal test file.
 * Reviewed and run by me; all tests pass with `npm test`.
 * Function under test: isVtEmail in validateEmail.ts (PM2.1).
 */
import { isVtEmail } from '../validateEmail';

test('accepts a normal VT email', () => {
  expect(isVtEmail('yourname@vt.edu')).toBe(true);
});

test('accepts uppercase', () => {
  expect(isVtEmail('YOURNAME@VT.EDU')).toBe(true);
});

test('rejects a non-VT email', () => {
  expect(isVtEmail('yourname@gmail.com')).toBe(false);
});

test('rejects nothing before the @', () => {
  expect(isVtEmail('@vt.edu')).toBe(false);
});

test('rejects a fake domain that starts with vt.edu', () => {
  expect(isVtEmail('yourname@vt.edu.evil.com')).toBe(false);
});

test('rejects an empty string', () => {
  expect(isVtEmail('')).toBe(false);
});
