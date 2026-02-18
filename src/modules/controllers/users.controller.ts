import { NextFunction, Request, Response } from 'express';
import { getUsersService, createUserService, patchUserService } from '../services/users.service';
import { logger } from '../../utils/winston.util';
import { UpdateUserBodyRequest } from '../../schemas/users.schema';

type PatchUserRequest = Request<{ id: string }, Record<string, unknown>, UpdateUserBodyRequest>;

export const getUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const params = req.query as { id?: number; full_name?: string; is_active?: boolean };
    const result = await getUsersService(params);
    if (!result || (Array.isArray(result) && result.length === 0)) {
      res.status(404).json({ success: false, error: 'No users found', data: [], count: 0 });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: result, count: Array.isArray(result) ? result.length : 1 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createUserService(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    logger.error('createUserController error', error);

    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const patchUserController = async (
  req: PatchUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const result = await patchUserService(userId, req.body);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
