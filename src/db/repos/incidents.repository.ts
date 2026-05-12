import { HttpErrors } from '../../utils/error.util';
import { db } from '../database';
import { Incident, Incidents, IncidentsInsert, Status } from '../entities/incidents.entity';
import { Comments } from '../entities/comments.entity';

const kmToDegrees = (km: number) => km / 111.32;

export type IncidentDetail = Incidents & {
  commentCount: number;
  reporterName: string | null;
  reporterPic: string | null;
  comments: (Pick<Comments, 'id' | 'content' | 'createdAt' | 'userId'> & {
    userFullName: string | null;
  })[];
};

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

  getSpecificIncident: async (id: number): Promise<IncidentDetail> => {
    // Get incident details with reporter info
    const incident = await db
      .selectFrom('incidents')
      .leftJoin('users', 'users.id', 'incidents.reporterId')
      .select([
        'incidents.id',
        'incidents.reporterId',
        'incidents.title',
        'incidents.description',
        'incidents.incidentType',
        'incidents.latitude',
        'incidents.longitude',
        'incidents.imageUrl',
        'incidents.createdAt',
        'incidents.status',
        'users.fullName as reporterName',
        'users.profileImgUrl as reporterPic'
      ])
      .where('incidents.id', '=', id)
      .executeTakeFirst();

    if (!incident) {
      throw HttpErrors.notFound(`Incident with id ${id} not found`);
    }

    // Get all comments with commenter profile pics
    const comments = await db
      .selectFrom('comments')
      .leftJoin('users', 'users.id', 'comments.userId')
      .select([
        'comments.id',
        'comments.content',
        'comments.createdAt',
        'comments.userId',
        'users.fullName as userFullName',
        'users.profileImgUrl as userProfilePic'
      ])
      .where('comments.incidentId', '=', id)
      .orderBy('comments.createdAt', 'desc')
      .execute();

    return {
      id: incident.id,
      reporterId: incident.reporterId,
      title: incident.title,
      description: incident.description,
      incidentType: incident.incidentType,
      latitude: incident.latitude,
      longitude: incident.longitude,
      imageUrl: incident.imageUrl,
      createdAt: incident.createdAt,
      status: incident.status,
      reporterName: incident.reporterName,
      reporterPic: incident.reporterPic || '',
      commentCount: comments.length,
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        userId: comment.userId,
        userFullName: comment.userFullName || 'Anonymous',
        userProfilePic: comment.userProfilePic || ''
      }))
    };
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
