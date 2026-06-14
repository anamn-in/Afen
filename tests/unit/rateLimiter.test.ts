import { Request, Response, NextFunction } from 'express';
import { Socket } from 'net';

const getRateLimiter = () => require('@api/middleware/RateLimiter').RateLimiter;

describe('RateLimiter middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    req = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as Socket,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('allows first request from a new IP', () => {
    const RateLimiter = getRateLimiter();
    RateLimiter(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 429 after 100 requests from same IP', () => {
    const RateLimiter = getRateLimiter();
    for (let i = 0; i < 100; i++) {
      RateLimiter(req as Request, res as Response, next as NextFunction);
    }
    next.mockClear();
    RateLimiter(req as Request, res as Response, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests, please slow down' });
  });

  it('falls back to "unknown" key when no IP or socket address', () => {
    const RateLimiter = getRateLimiter();
    const reqNoIp = { ip: undefined, socket: { remoteAddress: undefined } as Socket };
    RateLimiter(reqNoIp as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });
});