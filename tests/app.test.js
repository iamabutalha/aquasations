import app from '#src/app.js';
import { request } from 'express';
import { describe } from 'zod';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('Should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
    });
  });
});
