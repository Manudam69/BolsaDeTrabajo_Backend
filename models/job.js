const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    companyName:String,
    projectName: String,
    location: String,
    salary: Number,
    description: String
});

module.exports = mongoose.model("Job",jobSchema,"job");