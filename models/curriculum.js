const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const curriculumSchema = new Schema({
    name: String,
    address: {
        type: String,
        required:[true, "Debes de especificar la direccion"]
    },
    telephone: {
        type: Number,
        required:[true, "Debes de especificar el telefono"]
    },
    email: String,
    birthDate: {
        type: String,
        required:[true, "Debes de especificar la fecha de naciemiento"]
    },
    country: {
        type: String,
        required:[true, "Debes de especificar el país"]
    },
    profession: {
        type: String,
        required:[true, "Debes de especificar la profesion"]
    },
    experience:{
        type: String,
        required:[true, "Debes de especificar tu experiencia"]},
    visible: Boolean
});

module.exports = mongoose.model("Curriculum",curriculumSchema,"curriculum");
