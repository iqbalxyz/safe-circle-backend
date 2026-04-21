import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type Incident =
  | 'theft'
  | 'vandalism'
  | 'pothole'
  | 'utility_failure'
  | 'suspicious_activity'
  | 'other';
export type Status = 'open' | 'investigating' | 'resolved' | 'spam';
export type Timestamp = ColumnType<Date, Date | string>;

export interface IncidentsTable {
  id: Generated<number>;
  reporterId: number;
  title: string;
  description: string;
  incidentType: Incident;
  status: Status;
  latitude: number;
  longitude: number;
  imageUrl: string;
  createdAt: Timestamp;
}

export type Incidents = Selectable<IncidentsTable>;
export type IncidentsInsert = Insertable<IncidentsTable>;
export type IncidentsUpdate = Updateable<IncidentsTable>;
