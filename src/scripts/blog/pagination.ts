interface PaginationLabels {
  previous: string;
  next: string;
  goToPage: string;
}

export function renderPagination(
  container: HTMLElement,
  page: number,
  pages: number,
  labels: PaginationLabels,
  navigate: (page: number) => void,
) {
  container.replaceChildren();
  container.hidden = pages <= 1;
  if (container.hidden) return;

  const button = (target: number, text: string, label: string, disabled = false) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = text;
    element.className = 'blog-list-pagination__button';
    element.setAttribute('aria-label', label);
    element.disabled = disabled;
    if (target === page && !disabled) element.setAttribute('aria-current', 'page');
    element.addEventListener('click', () => navigate(target));
    container.append(element);
  };

  button(page - 1, '←', labels.previous, page === 1);
  const first = Math.max(1, Math.min(page - 2, pages - 4));
  for (let number = first; number <= Math.min(pages, first + 4); number++)
    button(number, String(number), `${labels.goToPage} ${number}`);
  button(page + 1, '→', labels.next, page === pages);
}
