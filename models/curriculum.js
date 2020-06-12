const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Inicio de los campos que se guardaran en la base de datos de mongo
const curriculumSchema = new Schema({
    //Campo de la direccion
    name: String,
    address: {
        type: String,
        required: [true, "Debes de especificar la direccion"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo del telefono
    telephone: {
        type: Number,
        required: [true, "Debes de especificar el telefono"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo del email
    email: String,
    birthDate: {
        type: String,
        required: [true, "Debes de especificar la fecha de naciemiento"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo de la profesion
    profession: {
        type: String,
        required: [true, "Debes de especificar la profesion"]//Especifica que este campo es obligatorio de llenar
    },
    //Campo de la experiencia
    experience: {
        type: String,
        required: [true, "Debes de especificar tu experiencia"]
    }, //Especifica que este campo es obligatorio de llenar
    //Campo que define si el usuario desea mostrar la informacion
    visible: Boolean,
    idstate: Schema.Types.ObjectId
});

module.exports = mongoose.model("Curriculum", curriculumSchema, "curriculum"); //Creacion del Schema bajo el nombre de Curriculum
