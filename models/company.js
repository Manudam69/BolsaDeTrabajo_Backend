const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: String,
    companyName: String,
    cuit: Number,
    email: String,
    telephone: Number,
    sat: String,
    password: String
});

module.exports = mongoose.model("Company",companySchema,"company");
