// Safe on-campus meetup spots for trades.
// Kept free of React imports so they can be unit tested on their own.

export type MeetupSpot = {
  id: string;
  name: string;
  detail: string;
  // Lowercase words or places that, if a listing mentions them, point to this spot.
  aliases: string[];
};

// Busy, public, well-lit places on the Blacksburg campus.
export const MEETUP_SPOTS: MeetupSpot[] = [
  {
    id: 'newman',
    name: 'Newman Library',
    detail: 'Main entrance, by the front desk',
    aliases: ['newman', 'library'],
  },
  {
    id: 'squires',
    name: 'Squires Student Center',
    detail: 'Front lobby off College Ave',
    aliases: ['squires', 'student center'],
  },
  {
    id: 'turner',
    name: 'Turner Place at Lavery Hall',
    detail: 'Main dining entrance',
    aliases: ['turner', 'lavery'],
  },
  {
    id: 'dietrick',
    name: 'Dietrick Hall (D2)',
    detail: 'Front entrance, close to the residence halls',
    aliases: ['dietrick', 'd2', 'west aj', 'east aj', 'ambler johnston', 'dorm'],
  },
];

// Large items people usually carry from a dorm, so meet near the residence halls.
const BULKY_ITEM_WORDS = [
  'fridge', 'microwave', 'couch', 'futon', 'chair', 'desk', 'lamp',
  'rug', 'tv', 'television', 'mattress', 'shelf', 'dresser', 'furniture',
];

export type MeetupListing = { title: string; course: string; desc: string };

const DEFAULT_SPOT_ID = 'squires';

export const getMeetupSpot = (id: string): MeetupSpot | undefined =>
  MEETUP_SPOTS.find(spot => spot.id === id);

// Match whole words only, so "tv" doesn't match inside another word.
const mentions = (text: string, phrase: string): boolean =>
  new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`)
    .test(text);

// Pick the best default spot for a listing:
// 1. a spot the seller already mentioned in the title or description,
// 2. the library for course materials,
// 3. near the residence halls for bulky dorm items,
// 4. otherwise the student center.
export const suggestMeetupSpot = (listing: MeetupListing): MeetupSpot => {
  const text = `${listing.title} ${listing.desc}`.toLowerCase();

  const mentioned = MEETUP_SPOTS.find(spot => spot.aliases.some(a => mentions(text, a)));
  if (mentioned) return mentioned;

  if (listing.course.trim()) return getMeetupSpot('newman')!;

  if (BULKY_ITEM_WORDS.some(word => mentions(text, word))) return getMeetupSpot('dietrick')!;

  return getMeetupSpot(DEFAULT_SPOT_ID)!;
};

// The chat message sent when the buyer proposes a spot.
export const meetupMessage = (spot: MeetupSpot): string =>
  `Can we meet at ${spot.name} (${spot.detail.toLowerCase()})?`;