export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'STOCK_INSUFFICIENT'
  | 'INTERNAL';

export class AppError extends Error {
  public constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly httpStatus = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = (message = 'Authentication required'): AppError =>
  new AppError('UNAUTHORIZED', message, undefined, 401);
export const forbidden = (message = 'Forbidden'): AppError =>
  new AppError('FORBIDDEN', message, undefined, 403);
export const notFound = (message = 'Not found'): AppError =>
  new AppError('NOT_FOUND', message, undefined, 404);
export const validationError = (details?: unknown): AppError =>
  new AppError('VALIDATION_ERROR', 'Invalid input', details, 400);
export const conflict = (message: string): AppError =>
  new AppError('CONFLICT', message, undefined, 409);
export const rateLimited = (message = 'Too many requests'): AppError =>
  new AppError('RATE_LIMITED', message, undefined, 429);
export const stockInsufficient = (productId: string): AppError =>
  new AppError('STOCK_INSUFFICIENT', 'Not enough stock', { productId }, 409);
export const internal = (message = 'Internal server error'): AppError =>
  new AppError('INTERNAL', message, undefined, 500);
