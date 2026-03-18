const LABELS: Record<string, string> = {
  roomSize: 'Room size',
  wallAreaSqFt: 'Wall area',
  ceilingAreaSqFt: 'Ceiling area',
  totalAreaSqFt: 'Total area',
  paintGallonsNeeded: 'Paint gallons',
  ceilingHeightFt: 'Ceiling height',
  paintCeiling: 'Paint ceiling',
  paintMoldingOrTrim: 'Paint molding/trim',
  flooringType: 'Flooring type',
  areaSqFt: 'Area',
  costPerSqFtLow: 'Cost/sq ft (low)',
  costPerSqFtMid: 'Cost/sq ft (mid)',
  costPerSqFtHigh: 'Cost/sq ft (high)',
  lengthFt: 'Length',
  heightFt: 'Height',
  linearFt: 'Linear feet',
  fenceType: 'Material',
  costPerFtLow: 'Cost/ft (low)',
  costPerFtMid: 'Cost/ft (mid)',
  costPerFtHigh: 'Cost/ft (high)',
};

export function formatLabel(key: string): string {
  return LABELS[key] ?? key;
}
