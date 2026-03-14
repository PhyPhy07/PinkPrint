import { z } from 'zod';

const clarifyingQuestions = z
  .array(z.string())
  .optional()
  .describe('1-3 follow-up questions to clarify missing info (e.g. "Are you painting the ceiling too?", "Is this over concrete?"). Omit if user gave complete details.');

const paintVariant = z.object({
  projectType: z.literal('painting'),
  roomLengthFt: z.number().positive().default(12).describe('Room length in feet (use 12 if unknown)'),
  roomWidthFt: z.number().positive().default(12).describe('Room width in feet (use 12 if unknown)'),
  ceilingHeightFt: z.number().positive().default(8).describe('Ceiling height in feet'),
  paintCeiling: z.boolean().default(false).describe('Whether to paint the ceiling'),
  paintMoldingOrTrim: z.boolean().default(false).describe('Whether to paint molding, baseboards, or quarter round (semi-gloss)'),
  wallCount: z.number().positive().default(4),
  wallHeightFt: z.number().positive().default(8),
  wallAreaSqFt: z.number().positive().default(0),
  paintCoverageSqFt: z.number().positive().default(350),
  paintGallonsNeeded: z.number().positive().default(0),
  clarifyingQuestions,
});

const flooringVariant = z.object({
  projectType: z.literal('flooring'),
  roomLengthFt: z.number().positive().default(12).describe('Room length in feet (use 12 if unknown)'),
  roomWidthFt: z.number().positive().default(12).describe('Room width in feet (use 12 if unknown)'),
  flooringType: z
    .enum(['hardwood', 'carpet', 'tile', 'lvp'])
    .default('lvp')
    .describe('Type of flooring: hardwood, carpet, tile, or lvp (use lvp if unknown)'),
  flooringThicknessFt: z.number().positive().default(0.25).describe('Thickness in feet (e.g. 0.25 for 3 inches)'),
  flooringAreaSqFt: z.number().positive().default(0),
  flooringCostPerSqFt: z.number().positive().default(0),
  flooringCost: z.number().positive().default(0),
  clarifyingQuestions,
});

const fenceVariant = z.object({
  projectType: z.literal('fence'),
  fenceLengthFt: z.number().positive().default(20).describe('Fence length in feet (use 20 if unknown)'),
  fenceHeightFt: z.number().positive().default(6).describe('Fence height in feet (use 6 if unknown)'),
  fenceType: z
    .enum(['wood', 'metal', 'plastic'])
    .default('wood')
    .describe('Fence material: wood, metal, or plastic (use wood if unknown)'),
  fenceCostPerFt: z.number().positive().default(0),
  fenceCost: z.number().positive().default(0),
  clarifyingQuestions,
});

export const projectExtractionSchema = z.discriminatedUnion('projectType', [
  paintVariant,
  flooringVariant,
  fenceVariant,
]);

export type ProjectExtraction = z.infer<typeof projectExtractionSchema>;
