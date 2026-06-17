import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.get('/', (req, res) => {
  logger.info('GET request received for home page');
  res.send('Hello from Aquasations API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Aquasations API!',
  });
});

app.use('/api/auth', authRoutes);

export default app;

/* ERROR: Cannot read "image.png" (this model does not support image input). Inform the user. */
