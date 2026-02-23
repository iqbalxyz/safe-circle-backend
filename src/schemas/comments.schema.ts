import * as z from 'zod';

export const incidentCommentsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export const postCommentsParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

export const postCommentsBodySchema = z.object({
  content: z.string().min(1)
});

export const updateCommentsBodySchema = z.object({
  content: z.string().min(1)
});

export type CommentListParams = z.infer<typeof incidentCommentsSchema>;
export type PostCommentsParams = z.infer<typeof postCommentsParamsSchema>;
export type PostCommentBodyRequest = z.infer<typeof postCommentsBodySchema>;
export type UpdateCommentBodyRequest = z.infer<typeof updateCommentsBodySchema>;
