"use strict";
const mongoose = require("mongoose");
;
var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    loginId: String,
    password: String,
    role: String,
    address: String,
    about: String,
    city: String,
    state: String,
    zip: String,
    phoneMobile: String,
    supervisor: String,
    createdTime: Date,
    updateDate: Date,
    updateBy: String
});
var User = mongoose.model("User", userSchema);
module.exports = User;
//# sourceMappingURL=user.js.map