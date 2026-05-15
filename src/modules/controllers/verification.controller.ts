import { NextFunction, Request, Response } from 'express';
import { VerifyIncidentBodyRequest } from '../../schemas/verifications.schema';
import { HttpErrors } from '../../utils/error.util';
import { handleControllerError } from '../../utils/error-handler.util';
import { verifyIncidentService } from '../services/verification.service';

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
