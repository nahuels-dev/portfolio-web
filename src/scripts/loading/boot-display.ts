import { bootUI } from '../../i18n/boot';

export function createBootDisplay(root: HTMLElement) {
  const t = bootUI[document.documentElement.lang === 'en' ? 'en' : 'es'];
  const title = root.querySelector<HTMLElement>('[data-loading-title]')!;
  const note = root.querySelector<HTMLElement>('[data-loading-note]')!;
  const step = root.querySelector<HTMLElement>('[data-loading-step]')!;
  const phaseLabel = root.querySelector<HTMLElement>('[data-loading-phase]')!;
  const progressBar = root.querySelector<HTMLElement>('[data-loading-progress]')!;
  const percent = root.querySelector<HTMLElement>('[data-loading-percent]')!;
  const logs = [...root.querySelectorAll<HTMLElement>('[data-loading-log]')];
  let lastPhase = -1,
    lastProgress = -1;
  return {
    update(value: number) {
      const phase = value < 34 ? 0 : value < 76 ? 1 : 2;
      if (phase !== lastPhase) {
        lastPhase = phase;
        root.dataset.phase = String(phase);
        title.textContent = t.titles[phase];
        note.textContent = t.notes[phase];
        step.textContent = `0${phase + 1}`;
        phaseLabel.textContent = [t.connection, t.tracing, t.breach][phase];
      }
      if (value !== lastProgress) {
        lastProgress = value;
        progressBar.style.setProperty('--progress', String(value / 100));
        progressBar.setAttribute('aria-valuenow', String(value));
        percent.textContent = `${String(value).padStart(2, '0')}%`;
      }
    },
    complete() {
      title.textContent = t.titles[3];
      note.textContent = t.notes[3];
      phaseLabel.textContent = t.ready;
      step.textContent = '04';
      progressBar.style.setProperty('--progress', '1');
      progressBar.setAttribute('aria-valuenow', '100');
      percent.textContent = '100%';
    },
    ready(i: number) {
      logs[i]?.classList.add('is-ready');
      const check = logs[i]?.querySelector('[data-loading-check]');
      if (check) check.textContent = 'OK';
    },
  };
}
