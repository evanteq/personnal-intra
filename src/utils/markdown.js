function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderInline(str) {
  return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// Minimal markdown: #/##/### headings, **bold**, *italic*, "- " bullet lists, blank-line paragraphs.
// Input is HTML-escaped first so no raw markup can slip through.
export function renderMarkdown(text) {
  const lines = escapeHtml(text || '').split('\n')
  const out = []
  let inList = false

  function closeList() {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      closeList()
      const level = heading[1].length + 1
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }
    const item = line.match(/^[-*]\s+(.*)$/)
    if (item) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${renderInline(item[1])}</li>`)
      continue
    }
    closeList()
    out.push(line.trim() === '' ? '<br/>' : `<p>${renderInline(line)}</p>`)
  }
  closeList()
  return out.join('')
}
