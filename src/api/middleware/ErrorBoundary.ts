import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  console.log(`${req.method} ${req.path}`);
  next();
}

export function errorBoundary(err: any, req: Request, res: Response, next: NextFunction): void {
  if (err) {
    console.error('[ErrorBoundary]', err);
    res.status(400).json({ error: 'Invalid request' });
  } else {
    next();
  }
}