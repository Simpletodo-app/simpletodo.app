export function highlightTitle(title: string, searchTerm: string) {
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return title.replace(regex, '<mark>$1</mark>')
}

export function highlightMatches(text: string, searchTerm: string) {
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  const match = text.match(regex)

  if (!match) {
    return ''
  }

  const matchIndex = text.search(regex)
  const start = Math.max(0, matchIndex - 75)
  const end = Math.min(text.length, matchIndex + searchTerm.length + 75)
  let snippet = text.substring(start, end)

  // Ensure the snippet is within 150 characters
  if (snippet.length > 150) {
    const snippetStart = snippet.substring(0, 75)
    const snippetEnd = snippet.substring(snippet.length - 75, snippet.length)
    snippet = `${snippetStart}...${snippetEnd}`
  }

  const highlightedText = snippet.replace(regex, '<mark>$1</mark>')
  return highlightedText
}
