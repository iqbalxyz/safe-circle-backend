import { Comments, CommentsInsert, CommentsUpdate } from '../../db/entities/comments.entity';
import { CommentsRepository } from '../../db/repos/comments.repository';
import { PostCommentBodyRequest, UpdateCommentBodyRequest } from '../../schemas/comments.schema';

export const getCommentsFromIncidentService = async (incidentId: number): Promise<Comments[]> => {
  return await CommentsRepository.getComments(incidentId);
};

export const addCommentToIncidentService = async (
  incidentId: number,
  userId: number,
  data: PostCommentBodyRequest
): Promise<CommentsInsert> => {
  const commentData = {
    incidentId: incidentId,
    userId: userId,
    content: data.content,
    isEdited: false,
    createdAt: new Date()
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
    isEdited: true
  };
  return await CommentsRepository.patchComment(commentId, updatedComment);
};
