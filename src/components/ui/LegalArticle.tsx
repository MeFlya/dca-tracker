// Lightweight typography wrapper for /mentions-legales, /cgv, /confidentialite.
// Replaces the @tailwindcss/typography plugin (not installed) with explicit
// global child styling via a single className on the wrapping article.

import { cn } from "@/lib/utils";

export function LegalArticle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        // Base text
        "text-[15px] leading-relaxed text-gray-700",
        // Headings
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3",
        "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2",
        // Paragraphs
        "[&_p]:my-3 [&_p]:leading-relaxed",
        // Lists
        "[&_ul]:my-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1.5",
        "[&_ol]:my-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5",
        "[&_li]:leading-relaxed",
        // Links
        "[&_a]:text-primary-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-800",
        // Strong
        "[&_strong]:font-semibold [&_strong]:text-gray-900",
        // Tables
        "[&_table]:w-full [&_table]:my-5 [&_table]:text-sm [&_table]:border [&_table]:border-gray-200 [&_table]:rounded-lg [&_table]:overflow-hidden",
        "[&_thead]:bg-gray-50",
        "[&_th]:text-left [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-gray-700 [&_th]:border-b [&_th]:border-gray-200",
        "[&_td]:px-4 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-gray-100 [&_td]:align-top",
        // Section spacing
        "[&_section]:mb-6",
        className
      )}
    >
      {children}
    </article>
  );
}
