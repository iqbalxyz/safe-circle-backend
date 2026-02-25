import { CommentsRepository } from '../../db/repos/comments.repository';
import { Comments, CommentsInsert, CommentsUpdate } from '../../db/entities/comments.entity';
import { PostCommentBodyRequest, UpdateCommentBodyRequest } from '../../schemas/comments.schema';
import { format } from 'date-fns';

export const getCommentsFromIncidentService = async (incidentId: number): Promise<Comments[]> => {
  return await CommentsRepository.getComments(incidentId);
};

export const addCommentToIncidentService = async (
  incidentId: number,
  userId: number,
  data: PostCommentBodyRequest
): Promise<CommentsInsert> => {
  const commentData = {
    incident_id: incidentId,
    user_id: userId,
    content: data.content,
    is_edited: false,
    created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  };

  return await CommentsRepository.addComment(commentData);
};

export const deleteCommentService = async (commentId: number): Promise<void> => {
  await CommentsRepository.deleteComment(commentId);
};

export const patchCommentService = async (
  commentId: number,
  data: UpdateCommentBodyRequest
): Promise<CommentsUpdate> => {
  const updatedComment = {
    content: data.content,
    is_edited: true
  };
  return await CommentsRepository.patchComment(commentId, updatedComment);
};
