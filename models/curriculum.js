const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const curriculumSchema = new Schema({
    name: String,
    address: String,
    telephone: Number,
    email: String,
    birthDate: String,
    country: String,
    profession: String,
    experience:String
});

module.exports = mongoose.model("Curriculum",curriculumSchema,"curriculum");
