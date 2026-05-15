import { NextFunction, Request, Response } from 'express';
import {
  incidentQuerySchema,
  PostIncidentBodyRequest,
  UpdateIncidentStatusBodyRequest
} from '../../schemas/incidents.schema';
import { HttpErrors } from '../../utils/error.util';
import { handleControllerError } from '../../utils/error-handler.util';
import {
  createIncidentService,
  deleteIncidentService,
  getIncidentDetailService,
  getIncidentsService,
  updateIncidentStatusService
} from '../services/incidents.service';

export const getIncidentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filterParams = incidentQuerySchema.parse(req.query);
    const result = await getIncidentsService(filterParams);

    res.status(200).json({
      success: true,
      message: 'Incidents retrieved successfully',
      data: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const getIncidentDetailController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const incidentId = parseInt(req.params.id);

    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID'
      });
    }

    const result = await getIncidentDetailService(incidentId);

    res.status(200).json({
      success: true,
      message: 'Incident detail retrieved successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const createIncidentController = async (
  req: Request<unknown, unknown, PostIncidentBodyRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw HttpErrors.unauthorized('User not authenticated');
    }

    const reporterId = req.user.id;

    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await createIncidentService(req.body, reporterId);

    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const updateIncidentStatusController = async (
  req: Request<
    { id: string }, // params
    unknown, // res body
    UpdateIncidentStatusBodyRequest
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const incidentId = parseInt(req.params.id);

    if (isNaN(incidentId)) {
      throw HttpErrors.badRequest('Invalid incident ID');
    }

    if (!req.user) {
      throw HttpErrors.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'admin') {
      throw HttpErrors.forbidden('User does not have permission to update incident status');
    }

    const result = await updateIncidentStatusService(incidentId, {
      status: req.body.status!
    });

    res.status(200).json({
      success: true,
      message: 'Incident status updated successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};

export const deleteIncidentController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const incidentId = parseInt(req.params.id);

    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID'
      });
    }

    const result = await deleteIncidentService(incidentId);

    res.status(200).json({
      success: true,
      message: 'Incident deleted successfully',
      data: result
    });
  } catch (error) {
    handleControllerError(res, error);
    next(error);
  }
};
