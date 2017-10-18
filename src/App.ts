import * as express from 'express';

class App {
    // ref to Express instance
    public express: express.Application;
    //Run configuration methods on the Express instance.
    constructor() {
      this.express = express();
      this.middleware();
      this.routes();
    }
    // Configure Express middleware.
    private middleware(): void {
      console.log(`Firing up middleware()`);
    }

    // Configure API endpoints.
    private routes(): void {
      /* This is just to get up and running, and to make sure what we've got is
       * working so far. This function will change when we start to add more
       * API endpoints */
      console.log(`Firing up routes()`);
      let router = express.Router();
      // placeholder route handler

      
      router.get('/', (req, res, next) => {
        console.log('in get ');
        res.json({
          message: 'Hello Worlds champion !'
        });
      });
      this.express.use('/', router);
    }
  }
  export default new App().express;