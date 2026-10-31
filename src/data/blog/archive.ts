export interface BlogEntry {
  id: number;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

export interface ArchiveState {
  query: string;
  topic: string;
  order: 'newest' | 'oldest';
  page: number;
}

export const postsPerPage = 12;
export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export function readArchiveState(params: URLSearchParams): ArchiveState {
  const page = Number(params.get('page') ?? 1);
  return {
    query: (params.get('q') ?? '').trim().slice(0, 100),
    topic: normalizeSearch((params.get('topic') ?? '').slice(0, 32)),
    order: params.get('order') === 'oldest' ? 'oldest' : 'newest',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function filterEntries(entries: BlogEntry[], state: ArchiveState) {
  const words = normalizeSearch(state.query).split(/\s+/).filter(Boolean);
  return entries
    .filter((entry) => {
      const text = normalizeSearch([entry.title, entry.description, ...entry.tags].join(' '));
      return (
        words.every((word) => text.includes(word)) &&
        (!state.topic || entry.tags.some((tag) => normalizeSearch(tag) === state.topic))
      );
    })
    .sort(
      (a, b) =>
        (state.order === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) ||
        a.id - b.id,
    );
}

export function paginateEntries(entries: BlogEntry[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(entries.length / postsPerPage));
  const page = Math.min(pages, Math.max(1, requestedPage));
  return { page, pages, items: entries.slice((page - 1) * postsPerPage, page * postsPerPage) };
}

export function archiveURL(url: URL, state: ArchiveState) {
  const next = new URL(url);
  for (const key of ['q', 'topic', 'order', 'page']) next.searchParams.delete(key);
  if (state.query) next.searchParams.set('q', state.query);
  if (state.topic) next.searchParams.set('topic', state.topic);
  if (state.order === 'oldest') next.searchParams.set('order', state.order);
  if (state.page > 1) next.searchParams.set('page', String(state.page));
  return next;
}
