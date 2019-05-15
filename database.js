const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Manudam69:T69nDj4aPMIjQph0@elfarolito-ud4bm.gcp.mongodb.net/test", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos online en el puerto ${res.port}`);
});
