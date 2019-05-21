const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    companyName:String,
    projectName: String,
    category: String,
    charge: String,
    location: String,
    salary: Number,
    requirements: String,
    description: String
});

module.exports = mongoose.model("Job",jobSchema,"job");
