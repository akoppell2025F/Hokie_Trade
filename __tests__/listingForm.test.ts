/**
 * AI DISCLOSURE (CS3704 AI Policy)
 * These tests were generated with Claude (Anthropic, Opus 5.5) on 2026-10-23.
 * Prompt used: "write the code to add the functionality for sellers to create
 * listings", with unit tests requested for each new helper in listingForm.ts.
 * Reviewed and run by: Stephen Hull. Run with `npm test`.
 * Functions under test: parsePrice, validateListing, sellerNameFromEmail,
 * nextListingId, buildListing, formatPrice (listingForm.ts, PM2.1).
 */
import {
  type Listing, type ListingForm, emptyListingForm,
  parsePrice, validateListing, sellerNameFromEmail,
  nextListingId, buildListing, formatPrice,
} from '../listingForm';
import { filterListings } from '../searchUtils';

const validForm: ListingForm = {
  title: 'CS 3704 Textbook',
  course: 'CS 3704',
  price: '45',
  desc: 'Used one semester',
};

describe('parsePrice', () => {
  it('accepts whole dollars, cents, and a leading $', () => {
    expect(parsePrice('45')).toBe(45);
    expect(parsePrice('12.50')).toBe(12.5);
    expect(parsePrice(' $20 ')).toBe(20);
    expect(parsePrice('0')).toBe(0);
  });

  it('rejects letters, negatives, extra decimals, and huge prices', () => {
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('-5')).toBeNull();
    expect(parsePrice('4.999')).toBeNull();
    expect(parsePrice('10001')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});

describe('validateListing', () => {
  it('returns no errors for a valid form', () => {
    expect(validateListing(validForm)).toEqual({});
  });

  it('allows course and description to be empty', () => {
    expect(validateListing({ ...validForm, course: '', desc: '' })).toEqual({});
  });

  it('requires a title, even if only spaces were typed', () => {
    expect(validateListing({ ...validForm, title: '   ' }).title).toBeDefined();
  });

  it('rejects a title that is too long', () => {
    expect(validateListing({ ...validForm, title: 'x'.repeat(81) }).title).toBeDefined();
  });

  it('requires a valid price', () => {
    expect(validateListing({ ...validForm, price: '' }).price).toBeDefined();
    expect(validateListing({ ...validForm, price: 'free' }).price).toBeDefined();
  });

  it('reports every bad field at once', () => {
    expect(Object.keys(validateListing(emptyListingForm)).sort()).toEqual(['price', 'title']);
  });
});

describe('sellerNameFromEmail', () => {
  it('uses the part before the @', () => {
    expect(sellerNameFromEmail('hokiebird@vt.edu')).toBe('hokiebird');
  });

  it('falls back to "You" when there is no email', () => {
    expect(sellerNameFromEmail('')).toBe('You');
  });
});

describe('nextListingId', () => {
  it('starts at 0 when there are no listings', () => {
    expect(nextListingId([])).toBe(0);
  });

  it('is one more than the largest id', () => {
    expect(nextListingId([{ id: 0 }, { id: 5 }, { id: 2 }])).toBe(6);
  });
});

describe('buildListing', () => {
  it('trims text, uppercases the course, and converts the price', () => {
    const listing = buildListing(
      { title: '  Calc Notes ', course: ' math 2114 ', price: '$12.50', desc: ' PDF ' },
      7,
      'hokiebird',
    );
    expect(listing).toEqual({
      id: 7,
      emoji: '📘',
      title: 'Calc Notes',
      course: 'MATH 2114',
      price: 12.5,
      seller: 'hokiebird',
      desc: 'PDF',
    });
  });

  it('uses a box emoji when there is no course', () => {
    expect(buildListing({ ...validForm, course: '' }, 1, 'me').emoji).toBe('📦');
  });

  it('throws if the price was never validated', () => {
    expect(() => buildListing({ ...validForm, price: 'abc' }, 1, 'me')).toThrow();
  });
});

describe('formatPrice', () => {
  it('shows whole dollars without cents and others with two decimals', () => {
    expect(formatPrice(45)).toBe('$45');
    expect(formatPrice(12.5)).toBe('$12.50');
  });
});

// Integration: a listing created from the form can be found with the existing search.
describe('create listing + search', () => {
  it('finds a newly created listing by course number', () => {
    const existing: Listing[] = [
      { id: 0, emoji: '📦', title: 'Mini Fridge', course: '', price: 60, seller: 'Maria', desc: '' },
    ];
    const form = { title: 'Physics Lab Manual', course: 'phys 2305', price: '20', desc: '' };
    expect(validateListing(form)).toEqual({});

    const all = [buildListing(form, nextListingId(existing), 'me'), ...existing];
    const results = filterListings(all, 'PHYS2305');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });
});
