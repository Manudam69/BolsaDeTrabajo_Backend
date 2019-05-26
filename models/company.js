const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name:{
        type: String,
        required:[true, "Debes de especificar tu nombre"]
    },
    companyName: {
        type: String,
        required:[true, "Debes de especificar el nombre de la compañia"],
        unique: true
    },
    rfc:{
        type: String,
        required:[true, "Debes de especificar el RFC"],
        unique: true
    },
    email: {
        type: String,
        required:[true, "Debes de especificar el email"],
        unique: true
    },
    telephone: {
        type: String,
        required:[true, "Debes de especificar el telefono"]
    },
    sat: {
        type: String,
        required:[true, "Debes de especificar la razon social ante el sat"]
    },
    password: {
        type: String,
        required:[true, "Debes de especificar la contraseña"]
    },
    validated: Boolean
});

module.exports = mongoose.model("Company",companySchema,"company");
