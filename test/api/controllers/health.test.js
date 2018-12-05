const request = require('supertest');
const server = require('../../../app');

describe('controllers', function () {
  describe('health', function () {
    describe('GET /health/ping', function () {
      it('should return current status', async function () {
        await request(server)
          .get('/health/ping')
          .expect(200);
      });
    });
    describe('GET /health/stats', function () {
      it('should return uptime percentage over the last hour', async function () {
        await request(server)
          .get('/health/stats')
          .expect(200);
      });
    });
  });
});
