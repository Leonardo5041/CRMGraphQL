const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
    pedido: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cliente'
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    pagar: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        default: "PENDIENTE",

    },
    creado: {
        type: Date,
        default: Date.now()
    }


});
module.exports = mongoose.model('Pedido', ProductosSchema);