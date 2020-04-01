import { equal } from "assert";
import {Request} from "supertest";
import * as TwillioSms from "../src/controllers/twillioSMS";
import * as express from "express";


var app = require("../dist/index.js");
var suck = require('supertest')("http://localhost:3000");


//==================== user API test ====================

/**
 * Testing get all user endpoint
 */
describe("GET /api/user/", function () {
    it("respond with json containing a list of all users", function (done) {
        suck
            .get("/api/user/")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200, done);
    });
});

describe("GET /user", function() {
    it("responds with json", function(done) {
        suck
        .get("/api/user/")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200, done);
    });
  });