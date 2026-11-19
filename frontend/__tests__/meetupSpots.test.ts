import {
  MEETUP_SPOTS, getMeetupSpot, suggestMeetupSpot, meetupMessage,
} from '../src/utils/meetupSpots';

const listing = (title: string, course = '', desc = '') => ({ title, course, desc });

describe('MEETUP_SPOTS', () => {
  it('has unique ids', () => {
    const ids = MEETUP_SPOTS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every spot a name and detail', () => {
    for (const spot of MEETUP_SPOTS) {
      expect(spot.name.trim()).not.toBe('');
      expect(spot.detail.trim()).not.toBe('');
    }
  });
});

describe('getMeetupSpot', () => {
  it('finds a spot by id', () => {
    expect(getMeetupSpot('newman')?.name).toBe('Newman Library');
  });

  it('returns undefined for an unknown id', () => {
    expect(getMeetupSpot('nowhere')).toBeUndefined();
  });
});

describe('suggestMeetupSpot', () => {
  it('suggests the library for course materials', () => {
    expect(suggestMeetupSpot(listing('CS 3704 Textbook', 'CS 3704')).id).toBe('newman');
  });

  it('suggests near the dorms for bulky items', () => {
    expect(suggestMeetupSpot(listing('Mini Fridge')).id).toBe('dietrick');
    expect(suggestMeetupSpot(listing('Desk lamp')).id).toBe('dietrick');
  });

  it('uses a place the seller mentioned, ahead of other rules', () => {
    // Course listing that names Squires should still go to Squires.
    expect(suggestMeetupSpot(listing('Calc notes', 'MATH 1225', 'Can meet at Squires')).id)
      .toBe('squires');
    // "West AJ" maps to the spot near the residence halls.
    expect(suggestMeetupSpot(listing('Mini Fridge', '', 'Pickup near West AJ')).id)
      .toBe('dietrick');
  });

  it('ignores capitalization', () => {
    expect(suggestMeetupSpot(listing('COUCH FOR SALE')).id).toBe('dietrick');
  });

  it('matches whole words only', () => {
    // "tv" inside "TVTechs" and "desk" inside "deskjet" should not count as bulky.
    expect(suggestMeetupSpot(listing('TVTechs sticker pack')).id).toBe('squires');
    expect(suggestMeetupSpot(listing('HP deskjet ink')).id).toBe('squires');
  });

  it('treats a whitespace-only course as no course', () => {
    expect(suggestMeetupSpot(listing('Tutoring session', '   ')).id).toBe('squires');
  });

  it('falls back to the student center', () => {
    expect(suggestMeetupSpot(listing('Concert ticket')).id).toBe('squires');
  });

  it('always returns a spot from the list', () => {
    const spot = suggestMeetupSpot(listing(''));
    expect(MEETUP_SPOTS).toContain(spot);
  });
});

describe('meetupMessage', () => {
  it('names the spot and its detail', () => {
    const spot = getMeetupSpot('newman')!;
    expect(meetupMessage(spot)).toBe(
      'Can we meet at Newman Library (main entrance, by the front desk)?',
    );
  });
});