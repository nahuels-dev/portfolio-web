export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  service: string;
  lang: 'es' | 'en';
}

export interface SendResult {
  accepted: true;
  submissionId?: string;
}

export class ContactError extends Error {
  constructor(public readonly kind: 'timeout' | 'network' | 'rate-limit' | 'rejected') {
    super(kind);
    this.name = 'ContactError';
  }
}

export function generateContactKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function sendContactMessage(
  payload: ContactPayload,
  idempotencyKey: string,
): Promise<SendResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(
      import.meta.env.PUBLIC_CONTACT_ENDPOINT || 'https://mail.sora.agency/api/v1/contact',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        credentials: 'omit',
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );
    const data: unknown = await response.json().catch(() => null);
    if (controller.signal.aborted) throw new ContactError('timeout');
    if (
      response.ok &&
      data &&
      typeof data === 'object' &&
      'accepted' in data &&
      data.accepted === true
    ) {
      return {
        accepted: true,
        submissionId:
          'submissionId' in data && typeof data.submissionId === 'string'
            ? data.submissionId
            : undefined,
      };
    }
    throw new ContactError(response.status === 429 ? 'rate-limit' : 'rejected');
  } catch (error) {
    if (error instanceof ContactError) throw error;
    throw new ContactError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}
