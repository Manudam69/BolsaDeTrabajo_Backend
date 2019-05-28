const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Inicio de los campos que se guardaran en la base de datos de mongo
const jobSchema = new Schema({

    companyName:String, //Campo del nombre de la compañia
    projectName: String, //Campo del nombre del proyecto
    category: String, //Campo de la categoria del trabajo
    charge: String, //Campo del puesto de trabajo
    location: String, //Campo de la ubicacion
    salary: Number, //Campo del salario
    requirements: String, //Campo de los requerimientos
    description: String //Campo de una descripcion del trabajo
});

module.exports = mongoose.model("Job",jobSchema,"job");//Creacion del Schema bajo el nombre de Job
