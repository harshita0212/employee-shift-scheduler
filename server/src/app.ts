import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import shiftRoutes from './routes/shift.routes';
import leaveRoutes from './routes/leave.routes';
import availabilityRoutes from './routes/availability.routes';
import dashboardRoutes from './routes/dashboard.routes';
import codeReviewRoutes from './routes/code-review.routes';
import { handleAppError } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/code-review', codeReviewRoutes);

// Error handler
app.use(handleAppError);

export default app;
