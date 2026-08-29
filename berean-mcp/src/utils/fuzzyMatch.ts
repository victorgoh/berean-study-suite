/**
 * Fuzzy matching utilities using Levenshtein distance.
 */

export function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) {
    return levenshteinDistance(s2, s1);
  }
  if (s2.length === 0) {
    return s1.length;
  }

  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }

  return previousRow[previousRow.length - 1];
}

export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#146;/g, "'")
    .replace(/&#145;/g, "'")
    .replace(/&#147;/g, '"')
    .replace(/&#148;/g, '"');
}

export function findBestMatch(
  query: string,
  candidates: string[],
  keyTransform?: (raw: string) => string
): string | null {
  const queryClean = query.trim().toLowerCase();
  if (!queryClean) return null;

  const transform = keyTransform || ((k) => decodeHtmlEntities(k).toLowerCase());

  // 1. Exact match
  for (const raw of candidates) {
    const cleaned = transform(raw).toLowerCase();
    if (cleaned === queryClean) {
      return raw;
    }
    // Check leaf / split by '>' or '/'
    const parts = cleaned.split(/[>/]/).map((p) => p.trim());
    if (parts.length > 0 && parts[parts.length - 1] === queryClean) {
      return raw;
    }
  }

  // 2. Substring containment match
  const partials: string[] = [];
  for (const raw of candidates) {
    const cleaned = transform(raw).toLowerCase();
    const parts = cleaned.split(/[>/]/).map((p) => p.trim());
    const leaf = parts[parts.length - 1] || "";

    if (cleaned.includes(queryClean) || (leaf && leaf.includes(queryClean))) {
      partials.push(raw);
    } else if (queryClean.includes(cleaned) || (leaf && queryClean.includes(leaf))) {
      if (leaf.length >= 4 || cleaned.length >= 4) {
        partials.push(raw);
      }
    }
  }

  if (partials.length === 1) {
    return partials[0];
  } else if (partials.length > 1) {
    partials.sort((a, b) => transform(a).length - transform(b).length);
    return partials[0];
  }

  // 3. Levenshtein fuzzy distance
  let bestMatch: string | null = null;
  let minDistance = 9999;

  for (const raw of candidates) {
    const cleaned = transform(raw).toLowerCase();
    const parts = cleaned.split(/[>/]/).map((p) => p.trim());
    const targets = [cleaned, ...parts];

    for (const target of targets) {
      if (!target) continue;
      const dist = levenshteinDistance(queryClean, target);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = raw;
      }
    }
  }

  let threshold = 2;
  if (queryClean.length <= 4) {
    threshold = 1;
  } else if (queryClean.length > 8) {
    threshold = 3;
  }

  if (minDistance <= threshold) {
    return bestMatch;
  }

  return null;
}
