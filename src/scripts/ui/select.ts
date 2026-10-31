export function syncCustomSelect(input: HTMLInputElement) {
  const root = input.closest<HTMLElement>('[data-custom-select]')!;
  const options = [...root.querySelectorAll<HTMLElement>('[role="option"]')];
  const selected = options.find((option) => option.dataset.value === input.value) ?? options[0];
  if (!selected) return;
  input.value = selected.dataset.value ?? '';
  root.querySelector<HTMLElement>('[data-select-value]')!.textContent =
    selected.dataset.label ?? '';
  options.forEach((option) => option.setAttribute('aria-selected', String(option === selected)));
  root.querySelector('[role="combobox"]')!.setAttribute('aria-expanded', 'false');
  root.querySelector('[role="combobox"]')!.removeAttribute('aria-activedescendant');
  root.querySelector<HTMLElement>('[role="listbox"]')!.hidden = true;
  root.classList.remove('is-open');
}

function initSelect(root: HTMLElement, signal: AbortSignal) {
  const input = root.querySelector<HTMLInputElement>('input')!;
  const trigger = root.querySelector<HTMLButtonElement>('[role="combobox"]')!;
  const menu = root.querySelector<HTMLElement>('[role="listbox"]')!;
  const options = [...menu.querySelectorAll<HTMLElement>('[role="option"]')];
  if (!options.length) return;
  let active = 0;
  let typed = '';
  let lastTyped = 0;
  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
  const close = () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    menu.hidden = true;
    root.classList.remove('is-open');
  };
  const highlight = (index: number) => {
    active = Math.max(0, Math.min(options.length - 1, index));
    options.forEach((option, position) =>
      option.toggleAttribute('data-highlighted', position === active),
    );
    trigger.setAttribute('aria-activedescendant', options[active].id);
    const option = options[active];
    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight)
      menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
  };
  const place = () => {
    const rect = trigger.getBoundingClientRect();
    const below = innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const top = below < 180 && above > below;
    menu.dataset.side = top ? 'top' : 'bottom';
    menu.style.setProperty(
      '--select-max-height',
      `${Math.max(80, Math.min(288, top ? above : below))}px`,
    );
  };
  const open = () => {
    place();
    menu.hidden = false;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    highlight(
      Math.max(
        0,
        options.findIndex((option) => option.dataset.value === input.value),
      ),
    );
  };
  const choose = () => {
    const value = options[active].dataset.value ?? '';
    const changed = value !== input.value;
    input.value = value;
    syncCustomSelect(input);
    trigger.focus({ preventScroll: true });
    if (changed) input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  trigger.addEventListener('click', () => (isOpen() ? close() : open()), { signal });
  trigger.addEventListener(
    'keydown',
    (event) => {
      const key = event.key;
      if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        const wasOpen = isOpen();
        if (!wasOpen) open();
        if (key === 'Home' || key === 'End') highlight(key === 'Home' ? 0 : options.length - 1);
        else if (wasOpen && (key === 'Enter' || key === ' ')) choose();
        else if (wasOpen) highlight(active + (key === 'ArrowDown' ? 1 : -1));
      } else if (key === 'Escape' && isOpen()) {
        event.preventDefault();
        close();
      } else if (key === 'Tab' && isOpen()) choose();
      else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        typed = Date.now() - lastTyped > 700 || typed === key ? key : typed + key;
        lastTyped = Date.now();
        if (!isOpen()) open();
        const match = options
          .map((_, offset) => (active + offset + 1) % options.length)
          .find(
            (index) =>
              (options[index].dataset.label ?? '')
                .slice(0, typed.length)
                .localeCompare(typed, undefined, { sensitivity: 'base' }) === 0,
          );
        if (match !== undefined) highlight(match);
      }
    },
    { signal },
  );
  menu.addEventListener('mousedown', (event) => event.preventDefault(), { signal });
  menu.addEventListener(
    'click',
    (event) => {
      const option = (event.target as Element).closest<HTMLElement>('[role="option"]');
      if (option && options.includes(option)) {
        active = options.indexOf(option);
        choose();
      }
    },
    { signal },
  );
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!root.contains(event.target as Node)) close();
    },
    { signal },
  );
  root.addEventListener(
    'focusout',
    (event) => {
      if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) close();
    },
    { signal },
  );
  window.addEventListener(
    'resize',
    () => {
      if (isOpen()) place();
    },
    { signal },
  );
  window.addEventListener(
    'scroll',
    () => {
      if (isOpen()) place();
    },
    { signal, passive: true },
  );
  syncCustomSelect(input);
}

export function initCustomSelects(container: ParentNode) {
  const abort = new AbortController();
  container
    .querySelectorAll<HTMLElement>('[data-custom-select]')
    .forEach((root) => initSelect(root, abort.signal));
  return () => abort.abort();
}
