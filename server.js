var express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(express.static(path.resolve(__dirname, '../BolsaDeTrabajo_FrontEnd')));

// Parse x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON
app.use(bodyParser.json());

// Configuración global de rutas
app.use(require('./routes/index'));


mongoose.connect("mongodb+srv://Manudam69:T69nDj4aPMIjQph0@elfarolito-ud4bm.gcp.mongodb.net/test", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos online en el puerto ${res.port}`);
});

app.listen(8000,function () {
   console.log("Servidor iniciado");
});
