import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logDirectory = path.join(process.cwd(), 'logs');

const transport = new winston.transports.DailyRotateFile({
  dirname: logDirectory,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '1m',
  maxFiles: '14d',
  level: 'error',
  handleExceptions: true
});

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.json({ space: 2 }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    winston.format.label({ label: '[LOGGER]' }),
    winston.format.printf(
      (info) => ` ${info.label} ${info.timestamp} ${info.level} : ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      level: isDevelopment ? 'debug' : 'info',
      handleExceptions: true,
      format: winston.format.combine(winston.format.colorize({ all: true }))
    }),
    transport
  ]
});
