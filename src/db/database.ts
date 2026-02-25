import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { UsersTable } from './entities/users.entity';
import { IncidentsTable } from './entities/incidents.entity';
import { CommentsTable } from './entities/comments.entity';
import { VerificationsTable } from './entities/verifications.entity';
import neighborhoodWatch from '../config/neighborhood-watch';
import { UserAuthTable } from './entities/user-auth.entity';

export interface Database {
  // Table names must match exactly what's in the database
  users: UsersTable;
  incidents: IncidentsTable;
  comments: CommentsTable;
  verifications: VerificationsTable;
  user_auth: UserAuthTable;
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
