import { equal } from "assert";
import {Request} from "supertest";
import * as TwillioSms from "../src/controllers/twillioSMS";
import * as express from "express";

const app: any = require("../dist/app.js");
const suck: any = require("supertest")("http://localhost:3000");


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