import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';
export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;
    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded (20 per minute) slow down';
        break;

      case 'user':
        limit = 10;
        message = 'User request limit exceeded (20 per minute) slow down';
        break;

      case 'guest':
        limit = 5;
        message = 'Guest request limit exceeded (20 per minute) slow down';

        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );
    const decision = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        id: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      res
        .status(403)
        .json({ error: 'Forbidden', message: 'Automated req are not allowed' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked', {
        id: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate Limit Exceeded', {
        id: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      res.status(403).json({ error: 'Forbidden', message: 'Too many request' });
    }

    next();
  } catch (e) {
    console.log('Arcject middleware error: ', e);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with arcjet middleware',
    });
  }
};
