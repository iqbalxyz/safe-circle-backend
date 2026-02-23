import { NextFunction, Request, Response } from 'express';
import { handleControllerError } from '../../utils/error-handler.util';
import {
  addCommentToIncidentService,
  deleteCommentService,
  getCommentsFromIncidentService,
  patchCommentService
} from '../services/comments.service';
import { HttpErrors } from '../../utils/error.util';
import { PostCommentBodyRequest } from '../../schemas/comments.schema';

export const getCommentsFromIncidentController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const incidentId = parseInt(req.params.id);
    const result = await getCommentsFromIncidentService(incidentId);
    res.status(200).json({
      success: true,
      message: `Comments for id:${incidentId} retrieved successfully`,
      data: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const addCommentToIncidentController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw HttpErrors.unauthorized('User not authenticated');
    }

    const userId = req.user.id;
    const incidentId = parseInt(req.params.id);

    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID'
      });
    }

    const result = await addCommentToIncidentService(incidentId, userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const patchCommentController = async (
  req: Request<{ id: string }, unknown, PostCommentBodyRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = parseInt(req.params.id);
    const content = req.body.content;

    if (isNaN(commentId)) {
      throw HttpErrors.badRequest('Invalid incident ID');
    }

    if (!req.user) {
      throw HttpErrors.unauthorized('User not authenticated');
    }

    if (!content || content.length < 1) {
      throw HttpErrors.unauthorized('Content cannot be empty');
    }

    const result = await patchCommentService(commentId, { content });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const deleteCommentController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID'
      });
    }

    const result = await deleteCommentService(commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};
