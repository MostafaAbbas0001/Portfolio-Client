/**
 * Wraps every word of a trusted CMS headline in `.w > span` so it can rise
 * into place, keeping inline tags such as <span class="text-primary"> intact.
 */
export function splitWordsHtml(html: string, startIndex = 0) {
  let index = startIndex;
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<")) return part;
      return part
        .split(/(\s+)/)
        .map((chunk) => {
          if (!chunk) return "";
          if (/^\s+$/.test(chunk)) return " ";
          return `<span class="w" style="--i:${index++}"><span>${chunk}</span></span>`;
        })
        .join("");
    })
    .join("");
}

export function countWords(text: string) {
  return text
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}
