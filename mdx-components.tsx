import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1
        {...props}
        className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-[var(--maroon)]"
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        {...props}
        className="text-xl md:text-2xl font-bold mt-6 mb-3 text-[var(--maroon)]"
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        {...props}
        className="text-lg md:text-xl font-semibold mt-4 mb-2 text-[var(--maroon)]"
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p {...props} className="mb-4 leading-relaxed">
        {children}
      </p>
    ),
    code: ({ children, ...props }) => (
      <code
        {...props}
        className="px-1.5 py-0.5 rounded bg-[var(--ivory)] text-[var(--maroon)] font-mono text-sm"
      >
        {children}
      </code>
    ),
    ...components,
  };
}
