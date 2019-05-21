const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    user: String,
    email: String,
    password: String,
    validated: Boolean
});

module.exports = mongoose.model("User",userSchema,"user");