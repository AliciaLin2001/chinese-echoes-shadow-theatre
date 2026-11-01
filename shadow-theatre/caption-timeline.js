// Keep the latest caption through pauses, until the next cue starts.
// The final caption remains visible through the outro and after playback ends.
// Recorded speech end times are retained in the data for editorial reference.
export function captionAt(cues, time) {
  if (!Number.isFinite(time) || !cues.length) return { index: -1, previous: -1 };
  let low = 0, high = cues.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (cues[mid][0] <= time) low = mid + 1;
    else high = mid;
  }
  const previous = low - 1;
  return { previous, index: previous };
}

export function cueTranslation(cue, language) {
  if (!cue) return '';
  return cue[language === 'en' ? 5 : language === 'fr' ? 6 : 2] || '';
}
