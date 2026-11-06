/**
 * AI DISCLOSURE (CS3704 AI Policy)
 * Generated with Claude (Anthropic). 
 * Prompt: I asked Claude for feature suggestions, picked the rating change, and
 * asked where in App.tsx to make it. Claude wrote isValidRating and these tests.
 * Reviewed and run by me; all tests pass with `npm test`.
 * Function under test: isValidRating in validateRating.ts.
 */
import { isValidRating } from '../validateRating';

test('accepts ratings 1 through 5', () => {
  [1, 2, 3, 4, 5].forEach(n => expect(isValidRating(n)).toBe(true));
});

test('rejects 0 (no stars selected)', () => {
  expect(isValidRating(0)).toBe(false);
});

test('rejects above 5 and below 1', () => {
  expect(isValidRating(6)).toBe(false);
  expect(isValidRating(-1)).toBe(false);
});

test('rejects non-whole numbers and NaN', () => {
  expect(isValidRating(2.5)).toBe(false);
  expect(isValidRating(NaN)).toBe(false);
});