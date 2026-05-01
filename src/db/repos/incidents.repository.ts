import { HttpErrors } from '../../utils/error.util';
import { db } from '../database';
import { Incident, Incidents, IncidentsInsert, Status } from '../entities/incidents.entity';

const kmToDegrees = (km: number) => km / 111.32;

export const IncidentsRepository = {
  getIncidents: async (
    params: Partial<{
      status: Status;
      type: Incident;
      date: string;
      lat: string;
      lng: string;
      radius: number; // radius value
      radiusUnit: 'km' | 'miles' | 'degrees'; // unit of the radius
      limit: number;
    }>
  ): Promise<Incidents[]> => {
    let query = db.selectFrom('incidents').selectAll();

    if (params.status) {
      query = query.where('status', '=', params.status);
    }

    if (params.type) {
      query = query.where('incidentType', '=', params.type);
    }

    if (params.date) {
      const date = new Date(params.date);
      if (isNaN(date.getTime())) {
        throw HttpErrors.badRequest('Invalid date format');
      }
      query = query.where('createdAt', '>=', date);
    }

    if (params.lat && params.lng) {
      const lat = parseFloat(params.lat);
      const long = parseFloat(params.lng);

      if (isNaN(lat) || isNaN(long)) {
        throw HttpErrors.badRequest('Invalid latitude or longitude');
      }

      let radiusInDegrees = kmToDegrees(5);

      if (params.radius) {
        switch (params.radiusUnit) {
          case 'km':
            radiusInDegrees = kmToDegrees(params.radius);
            break;
          case 'miles':
            radiusInDegrees = params.radius / 69.17;
            break;
          case 'degrees':
            radiusInDegrees = params.radius;
            break;
          default:
            radiusInDegrees = kmToDegrees(params.radius);
        }
      }

      query = query
        .where('latitude', '>=', lat - radiusInDegrees)
        .where('latitude', '<=', lat + radiusInDegrees)
        .where('longitude', '>=', long - radiusInDegrees)
        .where('longitude', '<=', long + radiusInDegrees);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    return await query.execute();
  },

  getSpecificIncident: async (id: number): Promise<Incidents> => {
    const incident = await db
      .selectFrom('incidents')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!incident) {
      throw HttpErrors.notFound(`Incident with id ${id} not found`);
    }

    return incident;
  },

  addIncident: async (data: IncidentsInsert): Promise<Incidents> => {
    const result = await db.insertInto('incidents').values(data).executeTakeFirstOrThrow();

    if (!result || !result.insertId) {
      throw HttpErrors.internal('Failed to create incident');
    }

    const newIncident = await db
      .selectFrom('incidents')
      .selectAll()
      .where('id', '=', Number(result.insertId))
      .executeTakeFirstOrThrow();

    return newIncident;
  },

  deleteIncident: async (id: number): Promise<void> => {
    const result = await db.deleteFrom('incidents').where('id', '=', id).executeTakeFirst();

    if (!result || Number(result.numDeletedRows) === 0) {
      throw HttpErrors.notFound(`Incident with id ${id} not found`);
    }
  },

  patchIncidentStatus: async (id: number, status: Status): Promise<Incidents> => {
    const result = await db
      .updateTable('incidents')
      .set({ status })
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result || Number(result.numUpdatedRows) === 0) {
      throw HttpErrors.notFound(`Incident with id ${id} not found`);
    }

    const updatedIncident = await db
      .selectFrom('incidents')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    return updatedIncident;
  }
};
