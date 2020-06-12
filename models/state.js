const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Inicio de los campos que se guardaran en la base de datos de mongo
const stateSchema = new Schema({
    //Campo del estado
    state: {
        type: String,
        required:[true, "Debes de especificar el estado"]//Especifica que este campo es obligatorio de llenar
    }
});

module.exports = mongoose.model("State",stateSchema,"state"); //Creacion del Schema bajo el nombre de State
