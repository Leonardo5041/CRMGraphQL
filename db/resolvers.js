const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({
    path: 'variables.env'
});

const crearToken = (usuario, secreta, expiresIn) => {

    const {
        id,
        email,
        nombre,
        apellido
    } = usuario;
    return jwt.sign({
        id,
        email,
        nombre,
        apellido
    }, secreta, {
        expiresIn
    });

}

//Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, { }, ctx) => {
            return ctx.usuario;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        //Obtener producto mediante busqueda de su ID
        obtenerProducto: async (_, {
            id
        }) => {
            const producto = await Producto.findById(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            return producto;
        },
        //OBTENER LOS CLIENTES
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.log(Error);
            }

        },
        obtenerClientesVendedor: async (_, { }, ctx) => {
            try {
                const clientes = await Cliente.find({
                    vendedor: ctx.usuario.id.toString()
                });
                return clientes;
            } catch (error) {
                console.log(Error);
            }
        },
        obtenerCliente: async (_, {
            id
        }, ctx) => {
            //Revisar si el cliente existe o no
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }
            //Quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            return cliente;

        },
        //****************PEDIDOS*************** */
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, { }, ctx) => {
            try {
                const pedidos = await Pedido.find({
                    vendedor: ctx.usuario.id
                }).populate('cliente');
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedido: async (_, {
            id
        }, ctx) => {
            //Revisar si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }
            //Quien lo creo puede verlo
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            return pedido;
        },
        obtenerPedidosEstado: async (_, {estado}, ctx) => {
            const pedidos = await Pedido.find({
                vendedor: ctx.usuario.id,
                estado: estado
            });

            return pedidos;
        },
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([{
                $match: {
                    estado: "COMPLETADO"
                }
            },
            {
                $group: {
                    _id: "$cliente",
                    total: {
                        $sum: '$total'
                    }
                }
            },
            {
                $lookup: {
                    from: 'clientes',
                    localField: '_id',
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $limit: 10
            },
            {
                $sort: {
                    total: -1
                }
            }
            ]);

            return clientes;

        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([{
                $match: {
                    estado: "COMPLETADO"
                }
            },
            {
                $group: {
                    _id: "$vendedor",
                    total: {
                        $sum: '$total'
                    }
                }
            },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendedor'
                }
            },
            {
                $limit: 3
            },
            {
                $sort: {
                    total: -1
                }
            }


            ]);
            return vendedores;
        },
        buscarProducto: async (_, {
            texto
        }) => {
            const productos = await Producto.find({
                $text: {
                    $search: texto
                }
            })
            return productos;
        }



    },
    //******************************************MUTATIONS********************************************************* */
    Mutation: {
        nuevoUsuario: async (_, {
            input
        }) => {
            const {
                email,
                password
            } = input;
            //Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({
                email
            });
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');
            }

            //Hashear el password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            //Guardar en la base de datos
            try {
                const usuario = new Usuario(input);
                usuario.save();
                return usuario
            } catch (error) {
                console.log(error);
            }

        },
        autenticarUsuario: async (_, {
            input
        }) => {
            const {
                email,
                password
            } = input;
            //Si el usuario existe
            const existeUsuario = await Usuario.findOne({
                email
            });
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            //Revisar si el password es incorrecto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('El password es incorrecto');
            }

            //Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h')
            }
        },
        //----------------------------------PRODUCTOS-----------------------------------*
        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);

                //almacenar en la BD
                const resultado = await producto.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, {
            id,
            input
        }) => {
            let producto = await Producto.findById(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            //guardarlo en la base de datos
            producto = await Producto.findOneAndUpdate({
                _id: id
            }, input, {
                new: true
            });
            return producto;
        },
        eliminarProducto: async (_, {
            id
        }) => {
            let producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            //eliminarlo de la base de datos
            producto = await Producto.findOneAndDelete({
                _id: id
            });
            return "Se ha eliminado Correctamente";
        },
        //----------------------------------CLIENTES-----------------------------------*
        nuevoCliente: async (_, {
            input
        }, ctx) => {
            console.log(ctx);
            //verificar si el cliente ya existe
            const {
                email
            } = input
            const cliente = await Cliente.findOne({
                email
            });

            if (cliente) {
                throw new Error('El cliente ya se encuentra registrado');
            }
            const nuevoCliente = new Cliente(input);

            //asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;
            try {
                //guardarlo en la BD

                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }

        },
        actualizarCliente: async (_, {
            id,
            input
        }, ctx) => {
            //verificar si existe o no
            let cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe');
            }

            //verificar si el vendedor es quien edita
            //Quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }


            //guardar el cliente actualizado
            cliente = await Cliente.findOneAndUpdate({
                _id: id
            }, input, {
                new: true
            });
            return cliente;
        },

        //eliminar Cliente
        eliminarCliente: async (_, {
            id
        }, ctx) => {
            //verificar si existe o no
            let cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe');
            }

            //verificar si el vendedor es quien edita
            //Quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //Eliminar El cliente de la base de datos
            await Cliente.findOneAndDelete({
                _id: id
            });
            return "Cliente Eliminado"

        },
        //**************************PEDIDOS*************************** */
        nuevoPedido: async (_, { input }, ctx) => {
            const {
                cliente
            } = input
            //verificar si el cliente existe o no
            let clienteExiste = await Cliente.findById(cliente);
            if (!clienteExiste) {
                throw new Error('Ese cliente no existe');
            }

            //verificar si el cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            //Revisar el stock este disponible
            for await (const articulo of input.pedido) {
                const {
                    id
                } = articulo;

                const producto = await Producto.findById(id);

                if (articulo.cantidad > producto.existencia) {
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad existente`);
                } else {
                    //Restar la cantidad a los disponibles
                    producto.existencia = producto.existencia - articulo.cantidad;
                    await producto.save();
                }
            }

            //Crear un nuevo pedido

            const nuevoPedido = new Pedido(input);

            //asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            //guardarlo en la DB
            const resultado = await nuevoPedido.save();
            return resultado;

        },
        actualizarPedido: async (_, {
            id,
            input
        }, ctx) => {
            const {
                cliente
            } = input;
            //verificar si existe o no
            const existePedido = await Pedido.findById(id);
            if (!existePedido) {
                throw new Error('El pedido no existe');
            }
            //Verificar si existe el cliente
            const existeCliente = await Cliente.findById(cliente);
            if (!existeCliente) {
                throw new Error('El cliente no existe');
            }
            //verificar si el vendedor es quien edita
            //Quien lo creo puede verlo
            if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //Revisar el stock
            if (input.pedido) {
                for await (const articulo of input.pedido) {
                    const {
                        id
                    } = articulo;

                    const producto = await Producto.findById(id);

                    if (articulo.cantidad > producto.existencia) {
                        throw new Error(`El articulo: ${producto.nombre} excede la cantidad existente`);
                    } else {
                        //Restar la cantidad a los disponibles
                        producto.existencia = producto.existencia - articulo.cantidad;
                        await producto.save();
                    }
                }
            }



            //guardar el cliente actualizado
            const resultado = await Pedido.findOneAndUpdate({
                _id: id
            }, input, {
                new: true
            });
            return resultado;

        },
        eliminarPedido: async (_, {
            id
        }, ctx) => {
            //verificar si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('El pedido no existe');
            }

            //verificar si el vendedor es quien edita
            //Quien lo creo puede verlo
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //Eliminar El cliente de la base de datos
            await Pedido.findOneAndDelete({
                _id: id
            });
            return "Pedido Eliminado";
        }
    }


}
module.exports = resolvers;