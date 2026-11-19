// A failed recapture must not erase an earlier valid screenshot or its timestamp.
export function captureFailure(provider, problem) {
  return `- FLAG ${provider.rank}. ${provider.name}: ${problem}. ${provider.image ? 'Previous image retained.' : 'No image rendered.'}`;
}
export function captureStatus(provider, failed) {
  return failed ? (provider.image ? 'previous image retained; see capture-report.md' : 'omitted; see capture-report.md') : (provider.image ? 'captured' : 'omitted; see capture-report.md');
}
