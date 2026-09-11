export function stripHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html || ''
  return (div.textContent || '').replace(/\s+/g, ' ').trim()
}
