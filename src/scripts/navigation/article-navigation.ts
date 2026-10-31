function initArticleNavigation() {
  const article = document.querySelector<HTMLElement>('.blog-prose');
  const links = document
    .querySelector('.blog-toc')
    ?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
  if (!article || !links?.length) return () => {};

  const entries = Array.from(links).flatMap((link) => {
    const heading = document.getElementById(link.hash.slice(1));
    return heading && article.contains(heading) ? [{ link, heading }] : [];
  });
  if (!entries.length) return () => {};

  const abort = new AbortController();
  const { signal } = abort;
  let frame = 0;
  let active: HTMLAnchorElement | undefined;

  const update = () => {
    frame = 0;
    const readingLine = Math.min(window.innerHeight * 0.2, 160);
    let current = entries[0].link;
    for (const { link, heading } of entries) {
      if (heading.getBoundingClientRect().top > readingLine) break;
      current = link;
    }
    if (current === active) return;
    for (const { link } of entries) {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    active = current;
  };

  const schedule = () => {
    if (!signal.aborted && !frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { signal });
  window.addEventListener('pageshow', schedule, { signal });
  const observer = new ResizeObserver(schedule);
  observer.observe(article);
  void document.fonts.ready.then(schedule);
  update();

  return () => {
    abort.abort();
    cancelAnimationFrame(frame);
    observer.disconnect();
  };
}

const disposeArticleNavigation = initArticleNavigation();
if (import.meta.hot) import.meta.hot.dispose(disposeArticleNavigation);
