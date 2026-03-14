/**
 * Home Depot–style clarifying questions per project type.
 * These are merged with AI-generated questions when relevant.
 */

export const KNOWN_CLARIFYING_QUESTIONS: Record<string, string[]> = {
  painting: [
    'Is this an interior or exterior painting project?',
    'If exterior: Are you painting siding or brick?',
    'If interior: Is the room a children\'s room, kitchen, or bathroom? (These typically need higher sheen for cleanability.)',
    'Is this fresh drywall or existing paint?',
    'If existing paint: Is the current color dark?',
    'Will you be painting any molding, baseboards, or quarter round? (We\'ll add semi-gloss for trim.)',
  ],
};
