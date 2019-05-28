//Modelo para la compañia
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Inicio de los campos que se guardaran en la base de datos de mongo
const companySchema = new Schema({
  //Campo Nombre
    name:{
        type: String,
        required:[true, "Debes de especificar tu nombre"] //Especifica que este campo es obligatorio de llenar
    },
    //Campo Nombre de la compañia
    companyName: {
        type: String,
        required:[true, "Debes de especificar el nombre de la compañia"], //Especifica que este campo es obligatorio de llenar
        unique: true //Define que este campo no se puede repetir en la base de datos
    },
    //Campo RFC
    rfc:{
        type: String,
        required:[true, "Debes de especificar el RFC"], //Especifica que este campo es obligatorio de llenar
        unique: true //Define que este campo no se puede repetir en la base de datos
    },
    //Campo del email
    email: {
        type: String,
        required:[true, "Debes de especificar el email"], //Especifica que este campo es obligatorio de llenar
        unique: true //Define que este campo no se puede repetir en la base de datos
    },
    //Campo del telefono
    telephone: {
        type: String,
        required:[true, "Debes de especificar el telefono"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo del SAT
    sat: {
        type: String,
        required:[true, "Debes de especificar la razon social ante el sat"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo de la contraseña
    password: {
        type: String,
        required:[true, "Debes de especificar la contraseña"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo de la validacion
    validated: Boolean
});

module.exports = mongoose.model("Company",companySchema,"company"); //Creacion del Schema bajo el nombre de Company
