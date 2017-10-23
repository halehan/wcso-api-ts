"use strict";
const mongoose = require("mongoose");
;
var messageSchema = new mongoose.Schema({
    createdTime: String,
    threadStatus: String,
    message: String,
    threadId: String,
    messageId: String,
    userId: String
});
var Message = mongoose.model("Message", messageSchema);
module.exports = Message;
//# sourceMappingURL=message.js.map