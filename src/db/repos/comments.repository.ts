import { HttpErrors } from '../../utils/error.util';
import { db } from '../database';
import { Comments, CommentsInsert, CommentsUpdate } from '../types/comments.type';

export const CommentsRepository = {
  getComments: async (incidentId: number): Promise<Comments[]> => {
    return await db
      .selectFrom('comments')
      .selectAll()
      .where('incident_id', '=', incidentId)
      .execute();
  },

  addComment: async (data: CommentsInsert): Promise<Comments> => {
    const result = await db.insertInto('comments').values(data).executeTakeFirstOrThrow();

    if (!result || !result.insertId) {
      throw HttpErrors.internal('Failed to get inserted comment id');
    }

    const newComment = await db
      .selectFrom('comments')
      .selectAll()
      .where('id', '=', Number(result.insertId))
      .executeTakeFirstOrThrow();

    return newComment;
  },

  deleteComment: async (id: number): Promise<void> => {
    const result = await db.deleteFrom('comments').where('id', '=', id).executeTakeFirst();

    if (!result || Number(result.numDeletedRows) === 0) {
      throw HttpErrors.notFound(`Comment with id ${id} not found`);
    }
  },

  patchComment: async (id: number, data: CommentsUpdate): Promise<CommentsUpdate> => {
    const result = await db
      .updateTable('comments')
      .set({ content: data.content, is_edited: data.is_edited })
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result || Number(result.numUpdatedRows) === 0) {
      throw HttpErrors.notFound(`Comment with id ${id} not found`);
    }

    const updatedComment = await db
      .selectFrom('comments')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    return updatedComment;
  }
};
