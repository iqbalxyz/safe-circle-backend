import { NextFunction, Request, Response } from 'express';
import { handleControllerError } from '../../utils/error-handler.util';
import { loginUserService, registerUserService } from '../services/auth.service';

/**
 * Controller to handle POST requests for creating a new user.
 * @params {Request} req - The Express request object, containing the user data in the request body.
 **/
export const registerAuthController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUserService(req.body);

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
 * Controller to handle POST requests for user login.
 * @param req
 * @param res
 * @param next
 */
export const loginAuthController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUserService(req.body);

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
