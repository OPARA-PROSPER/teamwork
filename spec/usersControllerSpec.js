/* eslint-disable no-undef */
require('dotenv').config();
const axios = require('axios');

describe('User resource', () => {
  describe('GET /auth', () => {
    let response;
    beforeAll(async () => {
      response = await axios({
        url: 'https://a12613ab.ngrok.io/api/v1/auth',
        method: 'GET',
        headers: {
          Authorization: process.env.ADMIN_TOKEN,
        },
      });
    });

    it('return status code 200 with authentication token', () => {
      expect(response.status).toBe(200);
    });

    it('status message should be success', () => {
      expect(response.data.status).toBe('success');
    });

    it('response payload should be greater than 0', () => {
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    it('first payload data should have admin jobrole', () => {
      expect(response.data.data[0]).toEqual({
        id: 1,
        firstname: 'obimma',
        lastname: 'opara',
        email: 'oparaprosper@gmail.com',
        password: 'hisquare',
        gender: 'male',
        jobrole: 'admin',
        department: 'IT',
        address: 'FUTO',
      });
    });
  });
});
