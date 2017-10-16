"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const App_1 = require("./App");
const port = 3000;
App_1.default.set('port', port);
//create a server and pass our Express app to it.
const server = http.createServer(App_1.default);
server.listen(port);
server.on('listening', onListening);
//function to note that Express is listening
function onListening() {
    console.log(`Listening on port ` + port);
}
