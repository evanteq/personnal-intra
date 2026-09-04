// Fetches the site's real favicon via Google's public favicon service (same
// approach as Chrome bookmarks). This sends the link's domain to Google.
export function getFaviconUrl(url, size = 64) {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${hostname}`
  } catch {
    return null
  }
}
