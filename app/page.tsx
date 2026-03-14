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
    <div>
      <dt className="text-xs text-maroon">{label}</dt>
      <dd className="font-bold">{value}</dd>
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
      {/* Post-it note: pops up after user gets their estimate */}
      {result && result.clarifyingQuestions.length === 0 && (() => {
        const projectType = result.estimate.projectType?.toLowerCase() || 'painting';
        const items = COMMONLY_FORGOTTEN_ITEMS[projectType] ?? COMMONLY_FORGOTTEN_ITEMS.painting;
        return (
          <aside
            className="fixed left-1/2 top-[30%] z-10 w-64 -translate-x-1/2 -rotate-2 transform rounded-sm border border-amber-200 bg-amber-50 p-4 shadow-lg"
            style={{ boxShadow: '4px 4px 12px rgba(0,0,0,0.15)' }}
          >
            <h3 className="mb-2 font-bold text-amber-900">Don&apos;t forget!</h3>
            <ul className="space-y-1 text-sm text-amber-950">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-amber-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        );
      })()}
      {/* Mobile: small image banner at top */}
      <div className="relative mt-[12%] h-40 w-full overflow-hidden md:hidden">
        <img
          src="/pinkprint.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <main className="w-full min-w-0 max-w-2xl px-4 pb-8 pt-6 sm:mx-0 sm:ml-auto sm:mr-[10%] sm:px-0 sm:pt-0 mx-auto">
        <p className="mb-8 break-words text-maroon">
          Describe your project and get AI-assisted guidance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="project"
              className="mb-2 block break-words text-base sm:text-lg font-bold text-maroon"
            >
             The Project Path: What are we building babe? 
            </label>
            <textarea
              id="project"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I want to paint a 12x14 bedroom with 8-foot ceilings"
              rows={4}
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-ivory px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-lg bg-pink-500 px-6 py-2.5 font-bold text-ivory transition-colors hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Get response'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-maroon">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            {result.clarifyingQuestions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-ivory p-4 sm:p-6">
                <h2 className="mb-3 text-sm font-bold text-maroon">
                  Clarifying questions
                </h2>
                <ul className="list-inside list-disc space-y-2 break-words text-maroon">
                  {result.clarifyingQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <form onSubmit={handleRefine} className="mt-4 space-y-3">
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
                    rows={3}
                    className="w-full min-w-0 rounded-lg border border-amber-300 bg-ivory px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-ivory transition-colors hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Refining...' : 'Refine estimate'}
                  </button>
                </form>
              </div>
            )}
            {result.clarifyingQuestions.length === 0 && (
              <>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-bold text-maroon">
                Your project
              </h2>
              <div className="space-y-4 text-maroon">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-maroon">
                    {result.estimate.projectType}
                  </span>
                </div>
                <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="rounded-lg border border-rose-300 bg-rose-100 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-bold text-rose-900">
                Cost estimate
              </h2>
              <div className="space-y-2 text-rose-950">
                <p className="break-words text-xl font-extrabold text-rose-950 sm:text-2xl">
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
                <div className="mt-4 border-t border-rose-300 pt-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-900">
                    Materials breakdown
                  </h3>
                  <ul className="space-y-1.5 text-sm text-rose-950">
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

