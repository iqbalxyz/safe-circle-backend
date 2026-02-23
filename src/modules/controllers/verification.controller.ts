import { NextFunction, Request, Response } from 'express';
import { HttpErrors } from '../../utils/error.util';
import { verifyIncidentService } from '../services/verification.service';
import { handleControllerError } from '../../utils/error-handler.util';
import { VerifyIncidentBodyRequest } from '../../schemas/verifications.schema';

export const verifyIncidentController = async (
  req: Request<{ id: string }, unknown, VerifyIncidentBodyRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw HttpErrors.unauthorized('User not authenticated');
    }

    const incidentId = parseInt(req.params.id);
    const userId = req.user.id;
    const isVerified = req.body.isVerified;

    const result = await verifyIncidentService(incidentId, userId, { isVerified });

    res.status(200).json({
      success: true,
      message: 'Incident verified successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};
