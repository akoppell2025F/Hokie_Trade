// Helpers for the "Create listing" screen.
// Kept free of React imports so they can be unit tested on their own.

export type Listing = {
  id: number;
  emoji: string;
  title: string;
  course: string;
  price: number;
  seller: string;
  desc: string;
};

// What the seller types into the form. Price is a string because it comes
// straight from a TextInput.
export type ListingForm = {
  title: string;
  course: string;
  price: string;
  desc: string;
};

// One error message per field that failed validation.
export type ListingFormErrors = Partial<Record<keyof ListingForm, string>>;

export const emptyListingForm: ListingForm = { title: '', course: '', price: '', desc: '' };

export const MAX_TITLE_LENGTH = 80;
export const MAX_PRICE = 10000;

// Accepts "45", "45.5", "45.50", and "$45". Rejects negatives, letters,
// and more than two decimal places.
const PRICE_PATTERN = /^\$?\d+(\.\d{1,2})?$/;

// Turn the price text into a number, or null if it isn't a valid price.
export const parsePrice = (text: string): number | null => {
  const trimmed = text.trim();
  if (!PRICE_PATTERN.test(trimmed)) return null;
  const value = Number(trimmed.replace('$', ''));
  return value <= MAX_PRICE ? value : null;
};

// Check the form. An empty object means the listing can be posted.
export const validateListing = (form: ListingForm): ListingFormErrors => {
  const errors: ListingFormErrors = {};

  const title = form.title.trim();
  if (!title) {
    errors.title = 'Add a title so buyers know what you are selling.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Keep the title under ${MAX_TITLE_LENGTH} characters.`;
  }

  if (!form.price.trim()) {
    errors.price = 'Add a price (enter 0 if it is free).';
  } else if (parsePrice(form.price) === null) {
    errors.price = `Enter a price like 45 or 12.50, up to $${MAX_PRICE}.`;
  }

  return errors;
};

// Use the part of the email before the @ as the seller's display name,
// since the prototype has no real profiles yet.
export const sellerNameFromEmail = (email: string): string => {
  const local = email.trim().split('@')[0];
  return local || 'You';
};

// Next free id, one higher than the largest id in use.
export const nextListingId = (listings: Pick<Listing, 'id'>[]): number =>
  listings.reduce((max, l) => Math.max(max, l.id), -1) + 1;

// Build a Listing from a form that has already passed validateListing.
// Throws instead of guessing a price, so a skipped validation step fails loudly.
export const buildListing = (form: ListingForm, id: number, seller: string): Listing => {
  const price = parsePrice(form.price);
  if (price === null) {
    throw new Error('buildListing needs a valid price; call validateListing first.');
  }
  const course = form.course.trim().toUpperCase();
  return {
    id,
    emoji: course ? '📘' : '📦',
    title: form.title.trim(),
    course,
    price,
    seller,
    desc: form.desc.trim(),
  };
};

// Show whole-dollar prices as "$45" and others as "$12.50".
export const formatPrice = (price: number): string =>
  Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
