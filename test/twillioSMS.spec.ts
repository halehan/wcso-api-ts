import { equal } from "assert";
import { Request } from "supertest";
import * as TwillioSms from "../src/controllers/twillioSMS";
import * as express from "express";
import equalsIgnoreCase from '@composite/equals-ignore-case';

var app = require("../dist/index.js");
var request = require('supertest')("http://localhost:3000");

describe("GET /api/user/", function () {
  it("responds with json", function (done) {
    request
      .get("/api/user/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

describe("GET /api/user/:loginId", function () {
  it("responds with json", function (done) {
    request
      .get("/api/user/cgoodson@inspired-tech.net")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
});
});

describe("GET /sms/messages/", function () {
  it("responds with json", function (done) {
    request
      .get("/sms/messages/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

describe("GET /messages/5d9b9b63d50a2f0004825fb1", function () {
  it("responds with json", function (done) {
    request
      .get("/messages/5d9b9b63d50a2f0004825fb1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

describe("GET /sms/message/SM0c44963a5d2c432f8b25e688f65c3105", function () {
  it("responds with json", function (done) {
    request
      .get("/sms/message/SM0c44963a5d2c432f8b25e688f65c3105")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

describe("GET /api/content/", function () {
  it("responds with json", function (done) {
    request
      .get("/api/content/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
});

