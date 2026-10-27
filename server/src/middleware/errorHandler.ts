import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Never log passwords or secrets to console
  const safeMessage = err.message || 'Internal Server Error';
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, safeMessage);

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the submitted fields.',
      errors: formattedErrors,
    });
    return;
  }

  // 2. Mongoose Duplicate Key Error (e.g. unique email or compound index)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `An entry with this ${duplicateField} already exists.`,
    });
    return;
  }

  // 3. Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource ID provided.',
    });
    return;
  }

  // 4. Default 500 error
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'An unexpected error occurred. Please try again later.'
        : safeMessage,
  });
};
