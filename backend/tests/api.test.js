const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const connectDatabase = require('../config/db');
const mongoose = require('mongoose');

describe('API Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          confirmPassword: 'Test@1234',
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });

    it('should not register duplicate user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          confirmPassword: 'Test@1234',
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should login user', async () => {
      // First create admin user
      await User.create({
        email: 'admin@test.com',
        password: 'Admin@1234',
        role: 'admin',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Admin@1234',
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });
  });
});
```

// ### Create logs directory structure

//   Create a file backend/logs/.gitkeep to maintain the logs directory in git:
// ```
// # This file ensures the logs directory is tracked by git