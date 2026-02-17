import { Request, Response } from 'express';
import { getUsersService } from '../services/users.service';

export const getUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name } = req.query as { full_name: string };

    const result = await getUsersService(full_name);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      res.status(404).json({
        success: false,
        error: 'No users found',
        data: [],
        count: 0
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};
