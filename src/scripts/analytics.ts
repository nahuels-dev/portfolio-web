type AnalyticsChoice = 'granted' | 'denied';
type Clarity = ((...args: unknown[]) => void) & { q?: IArguments[] };

const analyticsWindow = window as Window & {
  dataLayer?: unknown[];
  clarity?: Clarity;
};

function initializeAnalytics() {
  if (!import.meta.env.PROD || window.location.hostname !== 'nahuel-s.dev') return;

  const panel = document.querySelector<HTMLElement>('[data-analytics-consent]');
  const settings = document.querySelector<HTMLButtonElement>('[data-analytics-settings]');
  const container = panel?.dataset.container;
  if (!panel || !settings || !container) return;

  const storageKey = 'analytics-consent';
  let choice: AnalyticsChoice | undefined;
  let openedFromSettings = false;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'granted' || saved === 'denied') choice = saved;
  } catch {}

  analyticsWindow.dataLayer ??= [];
  function gtag(..._args: unknown[]) {
    analyticsWindow.dataLayer?.push(arguments);
  }
  gtag('consent', 'default', {
    analytics_storage: choice === 'granted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  function loadTagManager() {
    if (document.getElementById('google-tag-manager')) return;
    analyticsWindow.clarity ??= function (..._args: unknown[]) {
      (analyticsWindow.clarity!.q ??= []).push(arguments);
    };
    analyticsWindow.clarity('consentv2', {
      analytics_Storage: 'granted',
      ad_Storage: 'denied',
    });
    analyticsWindow.dataLayer?.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.id = 'google-tag-manager';
    script.async = true;
    script.fetchPriority = 'low';
    script.src = `https://www.googletagmanager.com/gtm.js?id=${container}`;
    document.head.append(script);
  }

  function saveChoice(value: AnalyticsChoice) {
    const withdrawing = choice === 'granted' && value === 'denied';
    choice = value;
    try {
      localStorage.setItem(storageKey, value);
    } catch {}
    gtag('consent', 'update', { analytics_storage: value });
    analyticsWindow.clarity?.('consentv2', {
      analytics_Storage: value,
      ad_Storage: 'denied',
    });
    panel!.hidden = true;
    (openedFromSettings ? settings : document.getElementById('main'))?.focus({
      preventScroll: true,
    });
    openedFromSettings = false;
    if (value === 'granted') loadTagManager();
    if (withdrawing) window.location.reload();
  }

  settings.hidden = false;
  settings.addEventListener('click', () => {
    openedFromSettings = true;
    panel.hidden = false;
    panel.querySelector<HTMLButtonElement>('[data-analytics-choice]')?.focus();
  });
  panel.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>('[data-analytics-choice]');
    const value = button?.dataset.analyticsChoice;
    if (value === 'granted' || value === 'denied') saveChoice(value);
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && choice) {
      panel.hidden = true;
      settings.focus();
    }
  });

  const track = (name: string) => {
    if (choice !== 'granted') return;
    analyticsWindow.dataLayer?.push({ event: name, page_language: document.documentElement.lang });
    analyticsWindow.clarity?.('event', name);
  };
  document.addEventListener('portfolio:contact-open', () => track('contact_open'));
  document.addEventListener('portfolio:contact-sent', () => track('generate_lead'));
  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[download]'))
      track('download_cv');
  });

  panel.hidden = choice !== undefined;
  if (choice === 'granted') loadTagManager();
}

initializeAnalytics();
