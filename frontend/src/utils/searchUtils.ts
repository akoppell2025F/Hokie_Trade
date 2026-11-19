// Listing fields needed for searching
export type SearchableListing = {
  title: string;
  course: string;
  desc: string;
};

// Ignore capitalization and spaces when comparing text
export const normalizeSearch = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '');
};

// Return listings that match the search query
export const filterListings = <T extends SearchableListing>(
  listings: T[],
  query: string
): T[] => {
  const search = normalizeSearch(query);

  return listings.filter(listing =>
    normalizeSearch(listing.course).includes(search) ||
    normalizeSearch(listing.title).includes(search) ||
    normalizeSearch(listing.desc).includes(search)
  );
};

// Only offer the clear button once the user has typed something
export const showClearButton = (query: string): boolean => query.trim().length > 0;

// Count line shown above the results
export const resultCountText = (count: number): string =>
  `${count} ${count === 1 ? 'listing' : 'listings'} found`;
