import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";

const essayMDXComponents: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1
      {...props}
      className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-white"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="text-xl md:text-2xl font-bold mt-6 mb-3 text-white"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      className="text-lg md:text-xl font-semibold mt-4 mb-2 text-white"
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p {...props} className="mb-4 leading-relaxed text-white">
      {children}
    </p>
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono text-sm"
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-white"
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-4 list-disc pl-6 space-y-2 text-white [&>li]:marker:text-zinc-400"
    >
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li {...props} className="leading-relaxed text-white">
      {children}
    </li>
  ),
};

type Frontmatter = {
  title: string;
  date: string;
  description: string;
};

export const metadata: Metadata = {
  title: "From Sales Floor to Structured Output | Pink Print",
  description:
    "An essay about building Pink Print — a DIY project cost planner that combines 15 years of Home Depot sales floor experience with Gemini AI and the Vercel AI SDK.",
};

export default async function EssayPage() {
  const filePath = path.join(
    process.cwd(),
    "content/essays/pink-print-essay.mdx"
  );
  const source = await readFile(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<Frontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: essayMDXComponents,
  });

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/"
          className="inline-block text-white hover:underline mb-8 font-medium"
        >
          ← Back to Pink Print
        </Link>

        <article className="prose prose-lg prose-invert max-w-none prose-table:text-white">
          <header className="mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {frontmatter.title}
            </h1>
            <time
              dateTime={frontmatter.date}
              className="text-sm text-zinc-400"
            >
              {new Date(frontmatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>

          <div className="essay-content">{content}</div>
        </article>
      </main>
    </div>
  );
}
