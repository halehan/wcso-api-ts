"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }
    // Configure Express middleware.
    middleware() {
        console.log(`Firing up middleware()`);
    }
    // Configure API endpoints.
    routes() {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        console.log(`Firing up routes()`);
        let router = express.Router();
        // placeholder route handler
        router.get('/api', (req, res, next) => {
            res.json({
                message: 'Hello Worlds champion !'
            });
        });
        //    this.express.use('/', router);
    }
}
exports.default = new App().express;
