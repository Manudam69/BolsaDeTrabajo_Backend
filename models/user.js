const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required:[true, "Debes de especificar el nombre"]
    },
    email: {
        type: String,
        required:[true, "Debes de especificar el email"],
        unique:true
    },
    password: {
        type: String,
        required:[true, "Debes de especificar la contraseña"]
    },
    validated: Boolean
});

module.exports = mongoose.model("User",userSchema,"user");