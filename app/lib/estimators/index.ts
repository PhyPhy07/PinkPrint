/**
 * Deterministic estimate engine.
 * Computes area, quantities, materials, and cost from extracted project data.
 * No AI - pure math.
 */

export type MaterialItem = {
  name: string;
  quantity: number;
  unit: string;
  costLow: number;
  costMid: number;
  costHigh: number;
};

// Approximate cost per sq ft (budget to premium range)
const FLOORING_COST_PER_SQFT: Record<string, { low: number; mid: number; high: number }> = {
  lvp: { low: 2, mid: 4, high: 8 },
  hardwood: { low: 5, mid: 10, high: 15 },
  carpet: { low: 2, mid: 4, high: 8 },
  tile: { low: 3, mid: 8, high: 15 },
};

// Cost per linear ft for fence
const FENCE_COST_PER_FT: Record<string, { low: number; mid: number; high: number }> = {
  wood: { low: 15, mid: 25, high: 40 },
  metal: { low: 20, mid: 35, high: 55 },
  plastic: { low: 15, mid: 25, high: 45 },
};

// Paint: ~$30-50/gallon, 350 sq ft coverage
const PAINT_COST_PER_GALLON = { low: 25, mid: 40, high: 60 };
const PAINT_COVERAGE_SQFT = 350;
const WASTE_FACTOR = 1.1; // 10% waste

// Semi-gloss for trim (molding, baseboards, quarter round): ~1 quart per room
const TRIM_PAINT_QUARTS = 1;
const SEMI_GLOSS_COST_PER_QUART = { low: 15, mid: 22, high: 35 };

// Painting supplies (one-time per project)
const PAINTING_MATERIALS: MaterialItem[] = [
  { name: 'Primer', quantity: 1, unit: 'gallon', costLow: 15, costMid: 25, costHigh: 40 },
  { name: 'Roller & frame', quantity: 1, unit: 'each', costLow: 8, costMid: 15, costHigh: 25 },
  { name: 'Roller covers', quantity: 2, unit: 'each', costLow: 3, costMid: 6, costHigh: 12 },
  { name: 'Paint brushes', quantity: 2, unit: 'each', costLow: 5, costMid: 12, costHigh: 25 },
  { name: "Painter's tape", quantity: 2, unit: 'rolls', costLow: 5, costMid: 8, costHigh: 12 },
  { name: 'Drop cloths', quantity: 2, unit: 'each', costLow: 10, costMid: 18, costHigh: 30 },
];

// Flooring supplies (per sq ft or per project)
const FLOORING_UNDERLAYMENT = { low: 0.3, mid: 0.5, high: 0.8 }; // per sq ft
const FLOORING_TRIM_PER_LF = { low: 2, mid: 4, high: 8 }; // linear ft of perimeter
const FLOORING_TRANSITIONS = { low: 10, mid: 18, high: 30 }; // per transition, assume 2

// Fence supplies
const FENCE_POSTS_PER_FT = 1 / 8; // 1 post per 8 ft
const FENCE_POST_COST = { low: 8, mid: 15, high: 30 };
const FENCE_CONCRETE_PER_BAG = { low: 4, mid: 6, high: 8 };
const FENCE_HARDWARE = { low: 15, mid: 30, high: 50 }; // screws, brackets

export type EstimatedProject = {
  projectType: string;
  areaSqFt?: number;
  quantity?: number;
  costLow: number;
  costMid: number;
  costHigh: number;
  details: Record<string, string | number>;
  materials: MaterialItem[];
};

export function estimateProject(extracted: Record<string, unknown>): EstimatedProject {
  const projectType = String(extracted.projectType);

  if (projectType === 'painting') {
    return estimatePainting(extracted);
  }
  if (projectType === 'flooring') {
    return estimateFlooring(extracted);
  }
  if (projectType === 'fence') {
    return estimateFence(extracted);
  }

  return {
    projectType,
    costLow: 0,
    costMid: 0,
    costHigh: 0,
    details: {},
    materials: [],
  };
}

function estimatePainting(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.roomLengthFt) || 0;
  const width = Number(extracted.roomWidthFt) || 0;
  const ceilingHeight = Number(extracted.ceilingHeightFt) || 8;
  const paintCeiling = Boolean(extracted.paintCeiling);
  const paintMoldingOrTrim = Boolean(extracted.paintMoldingOrTrim);

  // Wall area: 2 * (length + width) * height
  const wallArea = 2 * (length + width) * ceilingHeight;

  // Ceiling area if painting ceiling
  const ceilingArea = paintCeiling ? length * width : 0;
  const totalArea = Math.ceil((wallArea + ceilingArea) * WASTE_FACTOR);

  const gallonsNeeded = Math.ceil(totalArea / PAINT_COVERAGE_SQFT);

  const materials: MaterialItem[] = [
    { name: 'Paint', quantity: gallonsNeeded, unit: 'gallons', costLow: PAINT_COST_PER_GALLON.low, costMid: PAINT_COST_PER_GALLON.mid, costHigh: PAINT_COST_PER_GALLON.high },
    ...PAINTING_MATERIALS,
  ];

  if (paintMoldingOrTrim) {
    materials.push({
      name: 'Semi-gloss (trim/molding)',
      quantity: TRIM_PAINT_QUARTS,
      unit: 'quart',
      costLow: SEMI_GLOSS_COST_PER_QUART.low,
      costMid: SEMI_GLOSS_COST_PER_QUART.mid,
      costHigh: SEMI_GLOSS_COST_PER_QUART.high,
    });
  }

  const materialsWithCosts = materials.map((m) => ({
    ...m,
    costLow: Math.round(m.quantity * m.costLow),
    costMid: Math.round(m.quantity * m.costMid),
    costHigh: Math.round(m.quantity * m.costHigh),
  }));

  const costLow = materialsWithCosts.reduce((sum, m) => sum + m.costLow, 0);
  const costMid = materialsWithCosts.reduce((sum, m) => sum + m.costMid, 0);
  const costHigh = materialsWithCosts.reduce((sum, m) => sum + m.costHigh, 0);

  return {
    projectType: 'painting',
    areaSqFt: Math.round(wallArea + ceilingArea),
    quantity: gallonsNeeded,
    costLow,
    costMid,
    costHigh,
    details: {
      wallAreaSqFt: Math.round(wallArea),
      ceilingAreaSqFt: Math.round(ceilingArea),
      totalAreaSqFt: Math.round(wallArea + ceilingArea),
      paintGallonsNeeded: gallonsNeeded,
      roomSize: `${length} × ${width} ft`,
      ceilingHeightFt: ceilingHeight,
      paintCeiling: paintCeiling ? 'Yes' : 'No',
      paintMoldingOrTrim: paintMoldingOrTrim ? 'Yes' : 'No',
    },
    materials: materialsWithCosts,
  };
}

function estimateFlooring(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.roomLengthFt) || 0;
  const width = Number(extracted.roomWidthFt) || 0;
  const flooringType = String(extracted.flooringType || 'lvp').toLowerCase();

  const areaSqFt = Math.ceil(length * width * WASTE_FACTOR);
  const costs = FLOORING_COST_PER_SQFT[flooringType] ?? FLOORING_COST_PER_SQFT.lvp;
  const perimeterFt = 2 * (length + width);

  const materials: MaterialItem[] = [
    { name: 'Flooring', quantity: areaSqFt, unit: 'sq ft', costLow: costs.low, costMid: costs.mid, costHigh: costs.high },
    { name: 'Underlayment', quantity: areaSqFt, unit: 'sq ft', costLow: FLOORING_UNDERLAYMENT.low, costMid: FLOORING_UNDERLAYMENT.mid, costHigh: FLOORING_UNDERLAYMENT.high },
    { name: 'Trim/molding', quantity: Math.round(perimeterFt), unit: 'linear ft', costLow: FLOORING_TRIM_PER_LF.low, costMid: FLOORING_TRIM_PER_LF.mid, costHigh: FLOORING_TRIM_PER_LF.high },
    { name: 'Transition strips', quantity: 2, unit: 'each', costLow: FLOORING_TRANSITIONS.low, costMid: FLOORING_TRANSITIONS.mid, costHigh: FLOORING_TRANSITIONS.high },
  ];

  const materialsWithCosts = materials.map((m) => ({
    ...m,
    costLow: Math.round(m.quantity * m.costLow),
    costMid: Math.round(m.quantity * m.costMid),
    costHigh: Math.round(m.quantity * m.costHigh),
  }));

  const costLow = materialsWithCosts.reduce((sum, m) => sum + m.costLow, 0);
  const costMid = materialsWithCosts.reduce((sum, m) => sum + m.costMid, 0);
  const costHigh = materialsWithCosts.reduce((sum, m) => sum + m.costHigh, 0);

  return {
    projectType: 'flooring',
    areaSqFt,
    quantity: areaSqFt,
    costLow,
    costMid,
    costHigh,
    details: {
      roomSize: `${length} × ${width} ft`,
      flooringType,
      areaSqFt,
      costPerSqFtLow: costs.low,
      costPerSqFtMid: costs.mid,
      costPerSqFtHigh: costs.high,
    },
    materials: materialsWithCosts,
  };
}

function estimateFence(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.fenceLengthFt) || 0;
  const height = Number(extracted.fenceHeightFt) || 0;
  const fenceType = String(extracted.fenceType || 'wood').toLowerCase();

  const linearFt = length;
  const costs = FENCE_COST_PER_FT[fenceType] ?? FENCE_COST_PER_FT.wood;
  const postCount = Math.max(2, Math.ceil(length * FENCE_POSTS_PER_FT) + 1); // +1 for end, min 2
  const concreteBags = postCount * 2; // ~2 bags per post

  const materials: MaterialItem[] = [
    { name: 'Fence panels', quantity: Math.round(linearFt), unit: 'linear ft', costLow: costs.low, costMid: costs.mid, costHigh: costs.high },
    { name: 'Posts', quantity: postCount, unit: 'each', costLow: FENCE_POST_COST.low, costMid: FENCE_POST_COST.mid, costHigh: FENCE_POST_COST.high },
    { name: 'Concrete', quantity: concreteBags, unit: 'bags', costLow: FENCE_CONCRETE_PER_BAG.low, costMid: FENCE_CONCRETE_PER_BAG.mid, costHigh: FENCE_CONCRETE_PER_BAG.high },
    { name: 'Hardware (screws, brackets)', quantity: 1, unit: 'kit', costLow: FENCE_HARDWARE.low, costMid: FENCE_HARDWARE.mid, costHigh: FENCE_HARDWARE.high },
  ];

  const materialsWithCosts = materials.map((m) => ({
    ...m,
    costLow: Math.round(m.quantity * m.costLow),
    costMid: Math.round(m.quantity * m.costMid),
    costHigh: Math.round(m.quantity * m.costHigh),
  }));

  const costLow = materialsWithCosts.reduce((sum, m) => sum + m.costLow, 0);
  const costMid = materialsWithCosts.reduce((sum, m) => sum + m.costMid, 0);
  const costHigh = materialsWithCosts.reduce((sum, m) => sum + m.costHigh, 0);

  return {
    projectType: 'fence',
    areaSqFt: length * height,
    quantity: linearFt,
    costLow,
    costMid,
    costHigh,
    details: {
      lengthFt: length,
      heightFt: height,
      linearFt,
      fenceType,
      costPerFtLow: costs.low,
      costPerFtMid: costs.mid,
      costPerFtHigh: costs.high,
    },
    materials: materialsWithCosts,
  };
}
