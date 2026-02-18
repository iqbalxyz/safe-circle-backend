import { NextFunction, Request, Response } from 'express';
import {
  getUsersService,
  createUserService,
  patchUserService,
  userLoginService,
  deleteUserService
} from '../services/users.service';
import { UpdateUserBodyRequest } from '../../schemas/users.schema';
import { handleControllerError } from '../../utils/error-handler.util';

type PatchUserRequest = Request<{ id: string }, Record<string, unknown>, UpdateUserBodyRequest>;

/**
 * Controller to handle GET requests for retrieving users based on query parameters.
 * @params {Request} req - The Express request object, containing query parameters for filtering users.
 **/
export const getUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const params = req.query as { id?: number; full_name?: string; is_active?: boolean };
    const result = await getUsersService(params);
    if (!result || (Array.isArray(result) && result.length === 0)) {
      res.status(404).json({ success: false, error: 'No users found', data: [], count: 0 });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle POST requests for creating a new user.
 * @params {Request} req - The Express request object, containing the user data in the request body.
 **/
export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createUserService(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Controller to handle PATCH requests for updating an existing user.
 * @param req
 * @param res
 * @param next
 * @returns
 */
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
      message: 'User updated successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

/**
 * Controller to handle POST requests for user login.
 * @param req
 * @param res
 * @param next
 */
export const userLoginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userLoginService(req.body);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

/**
 * Controller to handle DELETE requests for deleting an existing user.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteUserController = async (
  req: Request<{ id: string }>,
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

    const result = await deleteUserService(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};
