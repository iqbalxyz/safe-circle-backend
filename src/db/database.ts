import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { UsersTable } from './types/users.type';
import { IncidentsTable } from './types/incidents.type';
import { CommentsTable } from './types/comments.type';
import { VerificationsTable } from './types/verifications.type';
import neighborhoodWatch from '../config/neighborhood-watch';

export interface Database {
  // Table names must match exactly what's in your database (usually snake_case)
  users: UsersTable;
  incidents: IncidentsTable;
  comments: CommentsTable;
  verifications: VerificationsTable;
}

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: neighborhoodWatch.host,
      user: neighborhoodWatch.username,
      password: neighborhoodWatch.password,
      database: neighborhoodWatch.database,
      timezone: neighborhoodWatch.timezone,
      port: neighborhoodWatch.port,
      connectionLimit: 20,
      connectTimeout: 10000,
      waitForConnections: true,
      queueLimit: 0,
      idleTimeout: 60000,
      maxIdle: 10
    })
  })
});
