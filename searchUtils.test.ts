// Uses Jest globals (describe/it/expect) via the jest-expo preset.
import { filterListings, normalizeSearch } from './searchUtils';
// Tests cover search normalization and listing filtering.
const listings = [
  {
    title: 'CS 3704 Software Engineering Textbook',
    course: 'CS 3704',
    desc: 'Used one semester',
  },
  {
    title: 'Mini Fridge',
    course: '',
    desc: 'Pickup near West AJ',
  },
  {
    title: 'MATH 2114 Notes',
    course: 'MATH 2114',
    desc: 'Practice exams included',
  },
];

describe('normalizeSearch', () => {
  it('ignores capitalization and spaces', () => {
    expect(normalizeSearch('  CS 3704  ')).toBe('cs3704');
  });
});

describe('filterListings', () => {
  it('finds course numbers without spaces', () => {
    expect(filterListings(listings, 'cs3704')).toHaveLength(1);
  });

  it('ignores extra spaces and capitalization', () => {
    expect(filterListings(listings, '  CS 3704  ')).toHaveLength(1);
  });

  it('searches listing descriptions', () => {
    expect(filterListings(listings, 'west aj')[0].title).toBe('Mini Fridge');
  });

  it('returns no listings for an unmatched search', () => {
    expect(filterListings(listings, 'biology')).toHaveLength(0);
  });

  it('returns all listings for an empty search', () => {
    expect(filterListings(listings, '')).toHaveLength(3);
  });

  // AI-assisted (Claude Code, Opus 5.5): the two tests below were generated after
  // asking it to check that every search requirement in US-001 had a test.
  // Reviewed and run by Anvit Koppella.
  it('searches listing titles', () => {
    const results = filterListings(listings, 'MINIFRIDGE');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Mini Fridge');
  });

  it('treats a whitespace-only search like an empty search', () => {
    expect(filterListings(listings, '   ')).toHaveLength(3);
  });
});