import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely/dist/cjs';

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
  reporter_id: number;
  title: string;
  description: string;
  incident_type: Incident;
  status: Status;
  latitude: string;
  longitude: string;
  image_url: string;
  created_at: Timestamp;
}

export type Incidents = Selectable<IncidentsTable>;
export type IncidentsInsert = Insertable<IncidentsTable>;
export type IncidentsUpdate = Updateable<IncidentsTable>;
