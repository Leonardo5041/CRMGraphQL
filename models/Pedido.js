const mongoose = require('mongoose');

const PedidosSchema = mongoose.Schema({
    pedido: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    iva: {
        type: Number
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
    },
    fechaEntrega: {
        type: Date
    },
    fechaPago: {
        type: Date
    },

    estadoMateriaPrima:{
        type: String,
        default: "PENDIENTE",
    },
    fechaPagoMateriaPrima:{
        type:Date
    }



});
module.exports = mongoose.model('Pedido', PedidosSchema);