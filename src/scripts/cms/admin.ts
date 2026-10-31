import { parse } from 'yaml';

interface Cms {
  init(options: { config: Record<string, unknown> }): void;
}

const cmsWindow = window as Window & { CMS_MANUAL_INIT?: boolean; CMS?: Cms };
const status = document.querySelector<HTMLElement>('#cms-status');
const message = document.querySelector<HTMLElement>('#cms-message');
const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);

async function start() {
  const response = await fetch('/admin/config.yml', { cache: 'no-cache' });
  if (!response.ok) throw new Error('No se pudo leer la configuración del editor.');
  const config = parse(await response.text());
  if (!local && !config.backend.turbo_site_id) {
    if (message)
      message.textContent =
        'Falta conectar GitHub y Decap Turbo. Una vez creado el sitio, completá turbo_site_id en public/admin/config.yml. Mientras tanto podés editar el contenido desde localhost.';
    return;
  }
  if (local) {
    config.backend = { name: 'git-gateway', branch: 'develop' };
    config.local_backend = { url: 'http://127.0.0.1:8081/api/v1' };
  }
  config.load_config_file = false;
  cmsWindow.CMS_MANUAL_INIT = true;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/decap-cms@3.17.3/dist/decap-cms.js';
    script.integrity = 'sha384-RWRzuHfiZSWCt3nEvG7B0v3cMgM1C2UuJmgBSL92GQh4uXmNSkbcthql/mNBqvjr';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo descargar Decap CMS. Recargá la página.'));
    document.head.append(script);
  });
  const cms = cmsWindow.CMS;
  if (!cms) throw new Error('No se pudo iniciar el editor.');
  cms.init({ config });
  if (status) status.hidden = true;
}

start().catch((error: unknown) => {
  if (message)
    message.textContent = error instanceof Error ? error.message : 'No se pudo abrir el editor.';
});
