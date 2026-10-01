import type {StudioRoute} from './navigation';

export type StudioSection = 'learn' | 'words' | 'grammar' | 'review' | 'records';
export function studioSection(view: string): StudioSection {
  return view === 'words' || view === 'grammar' ? view : view === 'progress' ? 'records' : 'learn';
}

// Keep saved lesson and reference links intact; only the old landing pages move.
export function learningRedirect(route: StudioRoute): string | undefined {
  if (route.view === 'today' || route.view === 'review') return '/map/';
  if (route.view === 'library' || route.view === 'nce' && !route.book) return '/map/#/courses';
  if (route.view === 'nce' && !route.lesson && (route.book === 'NCE1' || route.book === 'NCE2')) {
    const query = route.query ? `?q=${encodeURIComponent(route.query)}` : '';
    return `/map/#/courses/${route.book}${query}`;
  }
}
