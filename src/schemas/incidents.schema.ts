import * as z from 'zod';
import { Status } from '../db/entities/incidents.entity';

export const incidentQuerySchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'spam']).optional(),
  type: z.string().optional(),
  date: z.coerce.date().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
  radiusUnit: z.enum(['km', 'miles', 'degrees']).default('km'),
  limit: z.coerce.number().default(10)
});

export const incidentDetailParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export const postIncidentSchema = z.object({
  title: z.string(),
  description: z.string(),
  incidentType: z
    .enum(['theft', 'vandalism', 'pothole', 'utility_failure', 'suspicious_activity', 'other'])
    .default('other'),
  latitude: z.string(),
  longitude: z.string(),
  imageUrl: z.string().optional()
});

export const updateIncidentStatusParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export const updateIncidentStatusQuerySchema = z.object({
  sort: z.enum(['asc', 'desc']).optional().default('asc')
});

export const updateIncidentStatusBodySchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'spam'] as const)
}) satisfies z.ZodType<{ status: Status }>;

export type IncidentListQueryParams = z.infer<typeof incidentQuerySchema>;
export type IncidentDetailParams = z.infer<typeof incidentDetailParamsSchema>;
export type PostIncidentBodyRequest = z.infer<typeof postIncidentSchema>;
export type UpdateIncidentParams = z.infer<typeof updateIncidentStatusParamsSchema>;
export type UpdateIncidentQueryParams = z.infer<typeof updateIncidentStatusQuerySchema>;
export type UpdateIncidentStatusBodyRequest = z.infer<typeof updateIncidentStatusBodySchema>;
