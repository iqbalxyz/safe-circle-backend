import dotenv from 'dotenv';

dotenv.config();

export type DatabaseConfig = {
  username: string;
  password: string;
  database: string;
  host: string;
  timezone: string;
  port: number;
};

export default {
  username: process.env.DATABASE_USERNAME ?? '',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? '',
  host: process.env.DATABASE_HOST ?? '',
  port: parseInt(process.env.DATABASE_PORT ?? '-1'),
  timezone: '+00:00'
} as DatabaseConfig;
