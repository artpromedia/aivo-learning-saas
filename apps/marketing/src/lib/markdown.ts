/**
 * Simple markdown-to-HTML renderer for blog and case study content.
 * Handles headings, bold, links, unordered lists, ordered lists, and paragraphs.
 */
export function renderMarkdown(content: string): string {
  return content
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      // h3
      if (trimmed.startsWith("### ")) {
        return `<h3 class="text-xl font-semibold text-aivo-navy-800 mt-8 mb-3">${inlineFormat(trimmed.slice(4))}</h3>`;
      }

      // h2
      if (trimmed.startsWith("## ")) {
        return `<h2 class="text-2xl font-bold text-aivo-navy-800 mt-10 mb-4">${inlineFormat(trimmed.slice(3))}</h2>`;
      }

      // Unordered list
      if (trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").map((line) => {
          const text = line.replace(/^-\s*/, "");
          return `<li class="ml-4">${inlineFormat(text)}</li>`;
        });
        return `<ul class="list-disc space-y-2 text-aivo-navy-600 my-4 pl-4">${items.join("")}</ul>`;
      }

      // Ordered list
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split("\n").map((line) => {
          const text = line.replace(/^\d+\.\s*/, "");
          return `<li class="ml-4">${inlineFormat(text)}</li>`;
        });
        return `<ol class="list-decimal space-y-2 text-aivo-navy-600 my-4 pl-4">${items.join("")}</ol>`;
      }

      // Standalone link (CTA-style)
      if (trimmed.startsWith("[") && trimmed.includes("\u2192")) {
        const match = trimmed.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return `<p class="my-6"><a href="${match[2]}" class="inline-flex items-center text-aivo-purple-600 font-semibold hover:text-aivo-purple-700">${match[1]}</a></p>`;
        }
      }

      // Paragraph
      return `<p class="text-aivo-navy-600 leading-relaxed my-4">${inlineFormat(trimmed)}</p>`;
    })
    .join("\n");
}

/** Converts inline markdown (bold, links) to HTML. */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-aivo-purple-600 hover:underline">$1</a>',
    );
}
