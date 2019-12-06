/* eslint-disable no-undef */
require('dotenv').config();
const request = require('request');

describe('Api', () => {
  const url = 'http://localhost:3000/api/v1/auth';

  describe('client request to get all users', () => {
    it('without an admin token should return status code of 400', (done) => {
      request.get(url, (error, response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('with an admin token should return a status code of 200', (done) => {
      request({ url, headers: { Authorization: process.env.ADMIN_TOKEN } }, (error, response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('with an admin token should return a status of success', (done) => {
      request(
        { url, headers: { Authorization: process.env.ADMIN_TOKEN } },
        (error, response, body) => {
          expect(JSON.parse(body).status).toBe('success');
          done();
        },
      );
    });
  });
});
