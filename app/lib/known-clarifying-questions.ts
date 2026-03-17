/**
 * Home Depot–style clarifying questions per project type.
 * These are merged with AI-generated questions when relevant.
 */

const INTERIOR_ROOM_WORDS = /\b(bedroom|kitchen|bathroom|living room|den|office|closet|hallway|dining room|nursery|guest room|master bedroom|laundry room|basement|attic|room)\b/i;
const DOOR_WORDS = /\bdoor(s)?\b/i;

export const PAINTING_DOOR_QUESTIONS: string[] = [
  'Is the door inside or outside?',
  'Is the door metal or wood?',
  'Has it been primed or previously painted?',
  'If previously painted: Is the paint oil-based?',
];

export const KNOWN_CLARIFYING_QUESTIONS: Record<string, string[]> = {
  painting: [
    'Is this an interior or exterior painting project?',
    'If exterior: Are you painting siding or brick?',
    'If interior: Is the room a children\'s room, kitchen, or bathroom? (These typically need a higher sheen for cleanability.)',
    'Are you painting fresh drywall or over existing paint? (We\'ll need to add a primer for fresh drywall.)',
    'If existing paint: Is the current color dark?(if so, we\'ll need toadd a primer for the new paint to cover it.)',
    'Will you be painting any molding, baseboards, or quarter round? (We\'ll need to add a semi-gloss paint for trim/molding/baseboards.)',
  ],
  flooring: [
    'Are there stairs, landings, or elevated areas to include?',
    'Are there alcoves, closets, or cutouts that complicate installation?',
    'What type of subfloor exists (concrete, plywood, existing tile, etc.)?',
    'Will there be any prep work required (removal of old flooring, leveling, moisture mitigation)?',
    'Will sealer be needed?',
    'Will you need to remove any previous tack strips or nails?',
  ],
  fence: [
    'Are there irregular shapes, slopes, or obstacles (trees, rocks, pools)?',
    'Are there gates, corners, or access points to account for?',
    'Should posts, rails, and panels included in the estimate, or only panels?',
    'Do you want to include finishes, stains, or paints in the cost?',
    'Do you have any pets that need to be fenced in?',
    'Do your pets ever chew on the fence?',
  ],
};

/** Returns known questions filtered by user input (e.g. skip inside/outside when user said "bedroom", use door questions when painting a door) */
export function getFilteredKnownQuestions(projectType: string, userInput: string): string[] {
  if (projectType !== 'painting') {
    return KNOWN_CLARIFYING_QUESTIONS[projectType] ?? [];
  }

  const input = userInput.toLowerCase();
  const isDoorProject = DOOR_WORDS.test(input);

  if (isDoorProject) {
    return PAINTING_DOOR_QUESTIONS;
  }

  const questions = KNOWN_CLARIFYING_QUESTIONS.painting;
  const isInterior = INTERIOR_ROOM_WORDS.test(input);

  return questions.filter((q) => {
    if (isInterior) {
      if (q.startsWith('Is this an interior or exterior')) return false;
      if (q.startsWith('If exterior:')) return false;
    }
    return true;
  });
}
