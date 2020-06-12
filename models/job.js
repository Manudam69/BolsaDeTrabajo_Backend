const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Inicio de los campos que se guardaran en la base de datos de mongo
const jobSchema = new Schema({

    companyName: String,
    email: String,
    projectName: {
        type: String,
        required: [true, "Debes de especificar el nombre del proyecto"]
    },
    category: {
        type: String,
        required: [true, "Debes de especificar el nombre la categoria"]
    },
    charge: {
        type: String,
        required: [true, "Debes de especificar el nombre el cargo"]
    },
    salary: {
        type: String,
        required: [true, "Debes de especificar el salario"]
    },
    requirements: {
        type: String,
        required: [true, "Debes de especificar los requisitos del proyecto"]
    },
    description: {
        type: String,
        required: [true, "Debes de especificar la descripcion del proyecto"]
    },
    idstate: Schema.Types.ObjectId
});

module.exports = mongoose.model("Job", jobSchema, "job");//Creacion del Schema bajo el nombre de Job
