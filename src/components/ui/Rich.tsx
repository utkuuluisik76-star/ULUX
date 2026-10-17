/**
 * Renders content text, turning every [[placeholder]] into a yellow marker so missing facts
 * are impossible to miss before launch. Search the content files for "[[" to find them all.
 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="todo">
        [{part}]
      </mark>
    ) : (
      part
    ),
  );
}

export const isPlaceholder = (text: string) => /\[\[.+?\]\]/.test(text);
