const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true

    },
    apellido: {
        type: String,
        trim: true
    },
    empresa: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        trim: false,
        unique: true
    },
    telefono: {
        type: String,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now()
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }

});
module.exports = mongoose.model('Cliente', ClientesSchema);