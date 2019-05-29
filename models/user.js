const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Inicio de los campos que se guardaran en la base de datos de mongo
const userSchema = new Schema({
  //Campo de nombre
    name: {
        type: String,
        required:[true, "Debes de especificar el nombre"] //Especifica que este campo es obligatorio de llenar
    },
    //Campo del email
    email: {
        type: String,
        required:[true, "Debes de especificar el email"], //Especifica que este campo es obligatorio de llenar
        unique:true //Indica que este campo debe de ser unico en la base de datos
    },
    //Campo de la contraseña
    password: {
        type: String,
        required:[true, "Debes de especificar la contraseña"] //Especifica que este campo es obligatorio de llenar
    },
    //Campo de la validacion del usuario
    validated: Boolean,
    type: String
});

module.exports = mongoose.model("User",userSchema,"user"); //Creacion del Schema bajo el nombre de User
