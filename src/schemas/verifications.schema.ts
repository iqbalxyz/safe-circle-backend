import * as z from 'zod';

export const verifyIncidentParamsSchema = z.object({
  id: z.number()
});

export const verifyIncidentBodySchema = z.object({
  is_verified: z.boolean().default(true)
});

export type VerifyIncidentParams = z.infer<typeof verifyIncidentParamsSchema>;
export type VerifyIncidentBodyRequest = z.infer<typeof verifyIncidentBodySchema>;
