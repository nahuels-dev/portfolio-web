import type { z } from 'zod';
import type { projectSchema } from '../../content/schemas';

export type Project = z.infer<typeof projectSchema>;
