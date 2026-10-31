import {
  archiveURL,
  filterEntries,
  paginateEntries,
  readArchiveState,
} from '../../data/blog/archive';
import { blogUI } from '../../i18n/blog';
import { renderPagination } from './pagination';
import { initCustomSelects, syncCustomSelect } from '../ui/select';
import { initInputGlitch } from '../effects/input-glitch';

function initBlogArchive() {
  const root = document.querySelector<HTMLElement>('[data-blog-archive]');
  if (!root) return () => {};
  const form = root.querySelector<HTMLFormElement>('[data-blog-controls]')!;
  const search = form.elements.namedItem('q') as HTMLInputElement;
  const inputGlitch = initInputGlitch(search);
  const topic = form.elements.namedItem('topic') as HTMLInputElement;
  const order = form.elements.namedItem('order') as HTMLInputElement;
  const disposeSelects = initCustomSelects(form);
  const summary = form.querySelector<HTMLElement>('[data-blog-summary]')!;
  const reset = form.querySelector<HTMLButtonElement>('[type="reset"]')!;
  const results = root.querySelector<HTMLElement>('[data-blog-results]')!;
  const status = form.querySelector<HTMLElement>('[data-blog-status]')!;
  const empty = root.querySelector<HTMLElement>('[data-blog-no-results]')!;
  const pagination = root.querySelector<HTMLElement>('[data-blog-pagination]')!;
  const cards = [...results.querySelectorAll<HTMLElement>(':scope > .blog-card')];
  const entries = cards.map((card, id) => ({
    id,
    title: card.querySelector('h3')?.textContent ?? '',
    description: card.querySelector('.blog-card__description')?.textContent ?? '',
    tags: [...card.querySelectorAll('.blog-tags .tag')].map((tag) => tag.textContent?.trim() ?? ''),
    date: card.querySelector('time')?.dateTime ?? '',
  }));
  const t = blogUI[root.dataset.lang === 'en' ? 'en' : 'es'];
  const abort = new AbortController();
  const { signal } = abort;
  let state = readArchiveState(new URL(location.href).searchParams);
  let timer = 0;

  const syncForm = (animate = false) => {
    search.value = state.query;
    inputGlitch.sync(animate);
    topic.value = state.topic;
    syncCustomSelect(topic);
    state.topic = topic.value;
    order.value = state.order;
    syncCustomSelect(order);
  };
  const readForm = () =>
    readArchiveState(
      new URLSearchParams({ q: search.value, topic: topic.value, order: order.value }),
    );
  const render = () => {
    const filtered = filterEntries(entries, state);
    const { page, pages, items } = paginateEntries(filtered, state.page);
    state.page = page;
    const visible = new Set(items.map((entry) => entry.id));
    cards.forEach((card, index) => (card.hidden = !visible.has(index)));
    results.append(...filtered.map((entry) => cards[entry.id]));
    empty.hidden = !entries.length || filtered.length > 0;
    status.textContent = `${filtered.length} ${filtered.length === 1 ? t.result : t.results}${filtered.length ? ` · ${t.page} ${page} ${t.of} ${pages}` : ''}`;
    reset.disabled = !state.query && !state.topic && state.order === 'newest';
    summary.hidden = !entries.length && reset.disabled;
    renderPagination(pagination, page, pages, t, (next) => {
      state = { ...readForm(), page: next };
      commit('push');
      status.focus({ preventScroll: true });
      status.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    document.dispatchEvent(new Event('portfolio:layout-change'));
  };

  const commit = (mode: 'push' | 'replace') => {
    clearTimeout(timer);
    render();
    const url = archiveURL(new URL(location.href), state);
    if (url.href !== location.href)
      history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  };
  const changeFilters = (mode: 'push' | 'replace') => {
    state = readForm();
    commit(mode);
  };

  const scheduleSearch = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => changeFilters('replace'), 180);
  };
  search.addEventListener(
    'input',
    (event) => {
      if (!event.isComposing) scheduleSearch();
    },
    { signal },
  );
  search.addEventListener('compositionend', scheduleSearch, { signal });
  for (const field of [topic, order])
    field.addEventListener('change', () => changeFilters('push'), { signal });
  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      changeFilters('push');
    },
    { signal },
  );
  form.addEventListener(
    'reset',
    (event) => {
      event.preventDefault();
      state = readArchiveState(new URLSearchParams());
      syncForm(true);
      commit('push');
    },
    { signal },
  );
  window.addEventListener(
    'popstate',
    () => {
      clearTimeout(timer);
      state = readArchiveState(new URL(location.href).searchParams);
      syncForm();
      commit('replace');
    },
    { signal },
  );
  for (const field of [search, topic, order]) field.disabled = false;
  form.hidden = false;
  syncForm();
  commit('replace');

  return () => {
    abort.abort();
    disposeSelects();
    inputGlitch.destroy();
    clearTimeout(timer);
  };
}

const disposeBlogArchive = initBlogArchive();
if (import.meta.hot) import.meta.hot.dispose(disposeBlogArchive);
