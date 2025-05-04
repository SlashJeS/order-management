import rateLimit from 'express-rate-limit';

const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 10;

export const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
}); 