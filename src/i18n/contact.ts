import type { Locale } from './ui';

export function getContactCopy(lang: Locale) {
  const es = lang === 'es';
  const tr = (a: string, b: string) => (es ? a : b);
  const steps = es
    ? ['Tu idea', 'El proyecto', 'Tus datos']
    : ['Your idea', 'The project', 'Your details'];
  const copy = {
    serviceError: tr('Elegí un servicio para continuar.', 'Choose a service to continue.'),
    messageError: tr(
      'Contame un poco más: escribí entre 20 y 4000 caracteres.',
      'Tell me a little more: use between 20 and 4000 characters.',
    ),
    nameError: tr('Escribí tu nombre.', 'Enter your name.'),
    emailError: tr(
      'Revisá el email: necesito una dirección válida para responderte.',
      'Check your email: I need a valid address to reply.',
    ),
    send: tr('Enviar consulta', 'Send enquiry'),
    sending: tr('Enviando…', 'Sending…'),
    sent: tr('Consulta enviada', 'Enquiry submitted'),
    retry: tr('Reintentar envío', 'Try again'),
    success: tr(
      'Tu consulta fue enviada. Gracias por contarme tu idea.',
      'Your enquiry has been submitted. Thanks for sharing your idea.',
    ),
    sendError: tr(
      'No pude confirmar el envío. Tus datos siguen acá: podés reintentar o escribirme por email.',
      'I couldn’t confirm your submission. Your details are still here: try again or email me directly.',
    ),
    timeoutError: tr(
      'El envío demoró más de lo esperado y no pude confirmarlo. Reintentá con los mismos datos o escribime por email.',
      'The request took longer than expected and I couldn’t confirm it. Retry with the same details or email me directly.',
    ),
    rateLimitError: tr(
      'Hubo demasiados intentos. Esperá un momento antes de volver a enviar, o escribime por email.',
      'There have been too many attempts. Wait a little before trying again, or email me directly.',
    ),
  };
  return { steps, copy };
}
