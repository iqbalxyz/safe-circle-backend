import { format } from 'date-fns';
import { IncidentsRepository } from '../../db/repos/incidents.repository';
import { Incidents } from '../../db/entities/incidents.entity';
import { Status, Incident } from '../../db/entities/incidents.entity';
import {
  IncidentListQueryParams,
  PostIncidentBodyRequest,
  UpdateIncidentStatusBodyRequest
} from '../../schemas/incidents.schema';
import { HttpErrors } from '../../utils/error.util';
import { logger } from '../../utils/winston.util';

export const getIncidentsService = async (
  filterParams: IncidentListQueryParams
): Promise<Incidents[]> => {
  logger.info('getIncidents: processing request', { filterParams });

  const repositoryParams: Partial<{
    status: Status;
    type: Incident;
    date: string;
    lat: string;
    long: string;
    radius: number;
    radiusUnit: 'km' | 'miles' | 'degrees';
    limit: number;
  }> = {};

  // Safely map status
  if (filterParams.status) {
    const validStatuses: Status[] = ['open', 'investigating', 'resolved', 'spam'];
    if (validStatuses.includes(filterParams.status as Status)) {
      repositoryParams.status = filterParams.status as Status;
    } else {
      throw HttpErrors.badRequest(`Invalid status: ${filterParams.status}`);
    }
  }

  // Safely map type
  if (filterParams.type) {
    const validTypes: Incident[] = [
      'theft',
      'vandalism',
      'pothole',
      'utility_failure',
      'suspicious_activity',
      'other'
    ];
    if (validTypes.includes(filterParams.type as Incident)) {
      repositoryParams.type = filterParams.type as Incident;
    } else {
      throw HttpErrors.badRequest(`Invalid incident type: ${filterParams.type}`);
    }
  }

  if (filterParams.date) {
    repositoryParams.date = filterParams.date.toISOString();
  }

  if (filterParams.lat !== undefined) {
    repositoryParams.lat = filterParams.lat.toString();
  }

  if (filterParams.long !== undefined) {
    repositoryParams.long = filterParams.long.toString();
  }

  if (filterParams.radius !== undefined) {
    repositoryParams.radius = filterParams.radius;
  }

  if (filterParams.limit !== undefined) {
    repositoryParams.limit = filterParams.limit;
  }

  return await IncidentsRepository.getIncidents(repositoryParams);
};

export const getIncidentDetailService = async (id: number): Promise<Incidents> => {
  logger.info('getIncidentDetail: processing request', { incidentId: id });
  const result = await IncidentsRepository.getSpecificIncident(id);
  if (!result) {
    throw HttpErrors.notFound(`Incident with id ${id} not found`);
  }

  return result;
};

export const createIncidentService = async (
  data: PostIncidentBodyRequest,
  reporterId: number
): Promise<Incidents> => {
  logger.info('createIncident: processing request', { data, reporterId });

  const repositoryData = {
    title: data.title,
    description: data.description,
    incident_type: data.incidentType,
    latitude: data.latitude as unknown as number,
    longitude: data.longitude as unknown as number,
    status: 'open' as Status,
    reporter_id: reporterId, // 🎯 REAL USER ID
    image_url: '',
    created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  };

  return await IncidentsRepository.addIncident(repositoryData);
};

export const updateIncidentStatusService = async (
  id: number,
  updateData: UpdateIncidentStatusBodyRequest
): Promise<Incidents> => {
  logger.info('updateIncidentStatus: processing request', {
    incidentId: id,
    ...updateData
  });

  const existingIncident = await IncidentsRepository.getSpecificIncident(id);

  if (!existingIncident) {
    throw HttpErrors.notFound(`Incident with id ${id} not found`);
  }

  return await IncidentsRepository.patchIncidentStatus(id, updateData.status);
};

export const deleteIncidentService = async (id: number): Promise<void> => {
  logger.info('deleteIncident: processing request', { incidentId: id });
  const existingIncident = await IncidentsRepository.getSpecificIncident(id);
  if (!existingIncident) {
    throw HttpErrors.notFound(`Incident with id ${id} not found`);
  }

  await IncidentsRepository.deleteIncident(id);
};
