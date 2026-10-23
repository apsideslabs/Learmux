/**
 * A deliberately tiny Markdown renderer for challenge briefings.
 *
 * Briefings are authored by us in a small subset of Markdown (paragraphs,
 * `inline code`, **bold**, fenced code blocks and bullet lists). Rather than
 * pull a full parser in for that, we render the subset here — and escape all
 * text first, so a briefing can never inject HTML.
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let i = 0;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (line.trimStart().startsWith('```')) {
      flushPara();
      flushList();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    if (line.trim() === '') {
      flushPara();
      flushList();
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      i++;
      continue;
    }

    flushList();
    para.push(line.trim());
    i++;
  }

  flushPara();
  flushList();
  return out.join('\n');
}
