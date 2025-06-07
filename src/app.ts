import express, { Application, Request, Response } from 'express';
import mainRouter from './routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', mainRouter);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

export default app;
