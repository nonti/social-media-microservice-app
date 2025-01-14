import logger from '../utils/logger.js';
import connectDB  from '../config/db.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RateLimiterRedis} from 'rate-limiter-flexible';
import Redis from 'ioredis';
import rateLimiter from 'express-rate-limit';
import RedisStore from 'rate-limit-redis'
import routes from '../routes/identity-service.js';
import errorHandler from '../middlewares/errorHandler.js';



const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Connect to Redis
const redisClient = new Redis(process.env.REDIS_URL);

//Middleware 
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method}  request to ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();

})

// DDos protection and rate limiting
const rateLimiterR = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10,
  duration: 1,
})

app.use((req, res, next) => {
  rateLimiter.consume(req.ip).then(() => next()).catch(logger.warn(`Rate limit exceeded for IP ${req.ip}`));
  res.status(429).json({
    success: false,
    message: 'Too many requests.'
  })
})

// IP based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  leagcyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({  success: false,  message: 'Too many requests.', })
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});


// Apply sensitive endpoints rate limiter to routes
app.use('/api/auth/register', sensitiveEndpointsLimiter);

// ROUTES
app.use('/api/auth', routes);


//Error handlers
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service is running on port ${PORT}`); 
})


//Unhandles promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at ', promise, ' reason', reason);
});