'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  const hasEstimate = result && result.clarifyingQuestions.length === 0;
  const est = result?.estimate;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <main
        className="grid grid-cols-1 md:grid-cols-[350px_1fr] w-full max-w-[1100px] min-h-[85vh] md:min-h-[85vh] rounded-2xl overflow-hidden border border-white/5 shadow-2xl backdrop-blur-sm"
        style={{
          background: 'rgba(240, 249, 248, 0.88)',
        }}
      >
        {/* Sidebar */}
        <aside className="flex flex-col items-center text-center p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/60" style={{ backgroundColor: 'var(--soft-pink-accent)' }}>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight" style={{ color: 'var(--text-light-pink)' }}>
            Pink Print
          </h1>
          <div className="w-full h-72 md:h-[450px] flex items-center justify-center mb-2 overflow-hidden">
            <img
              src="/builderbabe.png"
              alt="Builder character"
              className="w-full h-full object-contain object-center"
            />
          </div>
          <p className="text-lg md:text-xl" style={{ color: 'var(--text-light-pink)' }}>
            <strong style={{ color: 'var(--text-light-pink)' }}>Draft the Vision and Make Big Decisions </strong>
            <br />
       Let's Plan For Your Next Paint, Flooring, or Fence Project!
          </p>
          <Link
            href="/essay"
            className="text-lg md:text-xl font-semibold mt-10 hover:underline"
            style={{ color: '#FF51A8' }}
          >
         Blog: How I Built Pink Print →
          </Link>
        </aside>

        {/* Content */}
        <section className="p-6 md:p-10 overflow-y-auto flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are we building? e.g. I want to paint a 12x14 bedroom with 8-foot ceilings"
              disabled={loading}
              className="flex-1 min-w-0 px-5 py-4 rounded-xl text-lg border-2 placeholder:text-[#6a8f8a] transition-colors focus:outline-none focus:border-[var(--card-pink)] disabled:opacity-50"
              style={{
                backgroundColor: '#FEFEFA',
                borderColor: 'rgba(129, 191, 183, 0.8)',
                color: '#2f5f5a',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{ backgroundColor: '#FF3471' }}
            >
              {loading ? 'Planning...' : 'Start Planning'}
            </button>
          </form>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-base">
              {error}
            </div>
          )}

          {/* Clarifying questions */}
          {result && result.clarifyingQuestions.length > 0 && (
            <div
              className="mb-6 p-6 rounded-2xl border shadow-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4" style={{ color: '#FF3471' }}>
                Clarifying questions
              </h2>
              <ul className="list-disc list-outside pl-6 space-y-3 mb-5 text-lg leading-relaxed" style={{ color: '#2f5f5a' }}>
                {result.clarifyingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <form onSubmit={handleRefine} className="space-y-4">
                <label htmlFor="clarifying-answers" className="block text-lg font-bold" style={{ color: '#2f5f5a' }}>
                  Your answers (required to see cost estimate)
                </label>
                <textarea
                  id="clarifying-answers"
                  value={clarifyingAnswers}
                  onChange={(e) => setClarifyingAnswers(e.target.value)}
                  placeholder="e.g. Interior, kitchen, existing paint that's dark..."
                  rows={4}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 resize-y placeholder:text-[#6a8f8a] focus:outline-none focus:border-[var(--card-pink)] disabled:opacity-50"
                  style={{
                    backgroundColor: '#FEFEFA',
                    borderColor: 'rgba(129, 191, 183, 0.8)',
                    color: '#2f5f5a',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-base font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#FF3471' }}
                >
                  {loading ? 'Syncing Plan...' : 'Sync Plan'}
                </button>
              </form>
            </div>
          )}

          {/* Results grid */}
          {hasEstimate && est && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {/* Estimate card - full width */}
              <article
                className="sm:col-span-2 p-6 rounded-2xl text-white"
                style={{ backgroundColor: 'var(--card-pink)' }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">Cost Estimate</h3>
                <div className="text-4xl sm:text-5xl font-extrabold my-2">
                  ${est.costLow.toLocaleString()} — ${est.costHigh.toLocaleString()}
                </div>
                <p className="text-base opacity-90">
                  Mid-range: ~${est.costMid.toLocaleString()}
                  {est.areaSqFt != null && est.projectType !== 'fence' && (
                    <> | {est.areaSqFt} sq ft{est.projectType === 'painting' && est.quantity != null && <> · {est.quantity} gal paint</>}</>
                  )}
                  {est.quantity != null && est.projectType === 'fence' && <> | {est.quantity} linear ft</>}
                </p>
              </article>

              {/* Project specs */}
              <article
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: 'var(--soft-pink-accent)', borderColor: 'rgba(129, 191, 183, 0.65)', color: 'var(--text-light-pink)' }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-light-pink)' }}>
                  Project Specs
                </h3>
                <div className="space-y-2 text-base">
                  {Object.entries(est.details).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-[#81BFB7]/45 py-2">
                      <span>{formatLabel(key)}</span>
                      <strong style={{ color: 'var(--text-light-pink)' }}>{String(value)}</strong>
                    </div>
                  ))}
                </div>
              </article>

              {/* Materials */}
              <article
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: 'var(--soft-pink-accent)', borderColor: 'rgba(129, 191, 183, 0.65)', color: 'var(--text-light-pink)' }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-light-pink)' }}>
                  Materials
                </h3>
                {est.materials && est.materials.length > 0 ? (
                  <div className="space-y-2 text-base">
                    {est.materials.map((m, i) => (
                      <div key={i} className="flex justify-between border-b border-[#81BFB7]/45 py-2">
                        <span>{m.name} ({m.quantity} {m.unit})</span>
                        <strong style={{ color: 'var(--text-light-pink)' }}>
                          ${m.costLow.toLocaleString()} – ${m.costHigh.toLocaleString()}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base">See estimate above for cost range.</p>
                )}
              </article>

              {/* Don't forget / Pro tip */}
              <div
                className="sm:col-span-2 -rotate-1 p-5 rounded-xl border shadow-lg"
                style={{ backgroundColor: 'rgba(198, 230, 227, 0.6)', borderColor: 'rgba(129, 191, 183, 0.8)' }}
              >
                {/\bdoor(s)?\b/i.test(input) ? (
                  <>
                    <h3 className="font-bold mb-2 text-base" style={{ color: 'var(--card-pink)' }}>Pro tip</h3>
                    <p className="text-base" style={{ color: 'var(--text-light-pink)' }}>
                      To determine paint type, try rubbing a cotton ball with isopropyl (rubbing) alcohol on the door. If the paint softens or comes off, it&apos;s water-based; if nothing happens, it&apos;s likely oil-based.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#2f5f5a' }}>Don&apos;t forget!</h3>
                    <ul className="space-y-1 text-base" style={{ color: '#2f5f5a' }}>
                      {(COMMONLY_FORGOTTEN_ITEMS[est.projectType?.toLowerCase() || 'painting'] ?? COMMONLY_FORGOTTEN_ITEMS.painting).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: '#2f5f5a' }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
