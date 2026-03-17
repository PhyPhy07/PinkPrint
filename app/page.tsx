'use client';

import { useState } from 'react';

const COMMONLY_FORGOTTEN_ITEMS: Record<string, string[]> = {
  painting: [
    'Paint Can Opener',
    'Stir Sticks',
    'Sandpaper & spackle for patching (if needed)',
    'Tray Liners (if needed)',
    'Optional: Floetrol for latex paint (to help leveling & brush stroke prevention)',
  ],
  flooring: [
    'Underlayment',
    'Transition strips & trim',
    'Adhesive or underlayment (for LVP/tile)',
    'Expansion gap spacers',
    'Measuring tape & level',
  ],
  fence: [
    'Post hole digger or auger',
    'Concrete for post footings',
    'Gate hardware & hinges',
    'Post caps & brackets',
    'Screws & fasteners',
  ],
};

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
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
  return labels[key] ?? key;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-0.5">
      <dt className="text-xs text-maroon">{label}</dt>
      <dd className="text-sm font-bold">{value}</dd>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    extracted: Record<string, unknown>;
    estimate: {
      projectType: string;
      areaSqFt?: number;
      quantity?: number;
      costLow: number;
      costMid: number;
      costHigh: number;
      details: Record<string, string | number>;
      materials?: { name: string; quantity: number; unit: string; costLow: number; costMid: number; costHigh: number }[];
    };
    clarifyingQuestions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarifyingAnswers, setClarifyingAnswers] = useState('');

  async function handleSubmit(e: React.FormEvent, augmentedInput?: string) {
    e.preventDefault();
    const textToSend = augmentedInput ?? input.trim();
    if (!textToSend) return;

    setLoading(true);
    setError(null);
    if (!augmentedInput) {
      setResult(null);
      setClarifyingAnswers('');
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: textToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      const questions = Array.isArray(data.extracted?.clarifyingQuestions)
        ? data.extracted.clarifyingQuestions
        : [];
      setResult({
        extracted: data.extracted,
        estimate: data.estimate,
        clarifyingQuestions: questions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefine(e: React.FormEvent) {
    e.preventDefault();
    const combined = `${input.trim()}\n\n[Answers to clarifying questions]: ${clarifyingAnswers.trim()}`;
    await handleSubmit(e, combined);
  }

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden sm:p-6 sm:pt-[7%] lg:p-8">
      {/* Speech bubble: shows at the beginning, before user gets estimate */}
      {(!result || result.clarifyingQuestions.length > 0) && (
        <>
        {/* Desktop: fixed position */}
        <div
          className="hidden sm:block fixed left-[30%] top-[22%] z-10 max-w-[220px]"
        >
          <div
            className="relative rounded-2xl border-2 border-maroon bg-white px-4 py-3 shadow-md"
            style={{ borderColor: 'var(--color-maroon)' }}
          >
            <p className="text-base font-bold text-maroon sm:text-lg">
              On Wednesdays: We Build in Pink! Let&apos;s get to planning and budgeting your next project together.
            </p>
            {/* Bubble tail pointing left towards the builder babe */}
            <div
              className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-r-[12px] border-l-0 border-transparent border-r-maroon"
              style={{ borderRightColor: 'var(--color-maroon)' }}
            />
            <div
              className="absolute -left-2.5 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[7px] border-r-[10px] border-l-0 border-transparent border-r-white"
              style={{ borderRightColor: 'white' }}
            />
          </div>
        </div>
        </>
      )}
      {/* Mobile: small image banner at top */}
      <div className="relative mt-[12%] h-40 w-full overflow-hidden md:hidden">
        <img
          src="/pinkprint.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <main className="w-full min-w-0 max-w-2xl px-4 pb-4 pt-[8%] sm:mx-0 sm:ml-auto sm:mr-[5%] sm:px-0 sm:pt-[8%] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
        
            <textarea
              id="project"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are we building babe? e.g. I want to paint a 12x14 bedroom with 8-foot ceilings"
              rows={2}
              className="w-full min-w-0 sm:max-w-md rounded-lg border border-zinc-300 bg-ivory px-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-lg bg-pink-500 px-6 py-2.5 font-bold text-ivory transition-colors hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Planning...' : 'Start Planning'}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-maroon">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            {result.clarifyingQuestions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-ivory p-3 sm:p-4">
                <h2 className="mb-2 text-sm font-bold text-maroon">
                  Clarifying questions
                </h2>
                <ul className="list-inside list-disc space-y-1 break-words text-sm text-maroon">
                  {result.clarifyingQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <form onSubmit={handleRefine} className="mt-3 space-y-2">
                  <label
                    htmlFor="clarifying-answers"
                    className="block text-sm font-bold text-maroon"
                  >
                    Your answers (required to see cost estimate)
                  </label>
                  <textarea
                    id="clarifying-answers"
                    value={clarifyingAnswers}
                    onChange={(e) => setClarifyingAnswers(e.target.value)}
                    placeholder="e.g. Interior, kitchen, existing paint that's dark..."
                    rows={2}
                    className="w-full min-w-0 rounded-lg border border-amber-300 bg-ivory px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-ivory transition-colors hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Syncing Plan...' : 'Sync Plan'}
                  </button>
                </form>
              </div>
            )}
            {result.clarifyingQuestions.length === 0 && (
              <>
            <div className="rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
              <h2 className="mb-2 text-sm font-bold text-maroon">
                Your project
              </h2>
              <div className="space-y-2 text-maroon">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-maroon">
                    {result.estimate.projectType}
                  </span>
                </div>
                <dl className="grid min-w-0 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {Object.entries(result.estimate.details).map(([key, value]) => (
                    <Detail
                      key={key}
                      label={formatLabel(key)}
                      value={String(value)}
                    />
                  ))}
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-rose-300 bg-rose-100 p-3 sm:p-4">
              <h2 className="mb-2 text-sm font-bold text-rose-900">
                Cost estimate
              </h2>
              <div className="space-y-0.5 text-rose-950">
                <p className="break-words text-lg font-extrabold text-rose-950 sm:text-xl">
                  ${result.estimate.costLow.toLocaleString()} – ${result.estimate.costHigh.toLocaleString()}
                </p>
                <p className="text-sm text-rose-900">
                  Mid-range: ~${result.estimate.costMid.toLocaleString()}
                </p>
                {result.estimate.areaSqFt != null && result.estimate.projectType !== 'fence' && (
                  <p className="text-sm text-rose-900">
                    {result.estimate.areaSqFt} sq ft
                    {result.estimate.projectType === 'painting' && result.estimate.quantity != null && (
                      <> · {result.estimate.quantity} gallons paint</>
                    )}
                  </p>
                )}
                {result.estimate.quantity != null && result.estimate.projectType === 'fence' && (
                  <p className="text-sm text-rose-900">
                    {result.estimate.quantity} linear ft
                  </p>
                )}
              </div>
              {result.estimate.materials && result.estimate.materials.length > 0 && (
                <div className="mt-2 border-t border-rose-300 pt-2">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-900">
                    Materials breakdown
                  </h3>
                  <ul className="space-y-0.5 text-xs text-rose-950 sm:text-sm">
                    {result.estimate.materials.map((m, i) => (
                      <li key={i} className="flex min-w-0 flex-col gap-0.5 break-words sm:flex-row sm:justify-between sm:items-center sm:gap-4">
                        <span className="min-w-0">
                          {m.name} ({m.quantity} {m.unit})
                        </span>
                        <span className="min-w-0 shrink-0 font-semibold text-rose-950">
                          ${m.costLow.toLocaleString()} – ${m.costHigh.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky note in flow after cost estimate (no overlap with input) */}
            <div className="mt-3 -rotate-2 transform rounded-sm border border-amber-200 bg-amber-50 p-4 shadow-lg" style={{ boxShadow: '4px 4px 12px rgba(0,0,0,0.15)' }}>
              {/\bdoor(s)?\b/i.test(input) ? (
                <>
                  <h3 className="mb-2 text-lg font-bold text-amber-900">Pro tip</h3>
                  <p className="text-base leading-relaxed text-amber-950">
                    To determine paint type, try rubbing a cotton ball with isopropyl (rubbing) alcohol on the door. If the paint softens or comes off, it&apos;s water-based; if nothing happens, it&apos;s likely oil-based.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-bold text-amber-900">Don&apos;t forget!</h3>
                  <ul className="space-y-1 text-base text-amber-950">
                    {(COMMONLY_FORGOTTEN_ITEMS[result.estimate.projectType?.toLowerCase() || 'painting'] ?? COMMONLY_FORGOTTEN_ITEMS.painting).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-0.5 text-amber-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

