"use client";

import React from "react";
import "katex/dist/katex.min.css";
import katex from "katex";

interface KaTeXMathProps {
  text: string;
  className?: string;
}

/**
 * Parses markdown/plain text and renders LaTeX segments enclosed in $...$ or $$...$$ using KaTeX
 */
export function KaTeXMath({ text, className = "" }: KaTeXMathProps) {
  if (!text) return null;

  // Split by double dollar ($$...$$) for block or single dollar ($...$) for inline
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="my-2 block text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <code key={index} className="text-primary font-mono">{part}</code>;
          }
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-math mx-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <code key={index} className="text-primary font-mono">{part}</code>;
          }
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
