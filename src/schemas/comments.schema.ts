import * as z from 'zod';

export const incidentCommentsSchema = z.object({
  id: z.number()
});

export const postCommentsQuerySchema = z.object({
  id: z.number()
});

export const postCommentsBodySchema = z.object({
  content: z.string().min(1)
});

export type CommentListParams = z.infer<typeof incidentCommentsSchema>;
export type postCommentsParams = z.infer<typeof postCommentsQuerySchema>;
export type PostCommentBodyRequest = z.infer<typeof postCommentsBodySchema>;
