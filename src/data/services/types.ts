import type { z } from 'zod';
import type { serviceCopySchema, serviceSchema } from '../../content/schemas';

export type Service = z.infer<typeof serviceSchema>;
export type ServiceCopy = z.infer<typeof serviceCopySchema>;
export type ServiceId = Service['id'];
