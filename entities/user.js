"use strict";
const mongoose = require("mongoose");
;
var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    loginId: String,
    password: String,
    role: String,
    phoneMobile: String,
    supervisor: String,
    createDate: String,
    updateDate: String,
    updateBy: String
});
var User = mongoose.model("User", userSchema);
module.exports = User;
