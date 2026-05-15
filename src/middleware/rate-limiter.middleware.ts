import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient
  .connect()
  .then(() => console.log('Redis is successfully connected for Rate Limiter'))
  .catch((err) => console.error('Failed to connect to Redis:', err));

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    if (req.user?.role === 'admin') return 1000;
    return 100;
  },
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 3,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:email-verify:'
  }),

  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },

  validate: { keyGeneratorIpFallback: false },

  message: {
    status: 429,
    message: 'You have reached the maximum number of requests per day. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
