const {
    gql
} = require('apollo-server');
//Schema
const typeDefs = gql`
    type Usuario{
        id:ID
        nombre:String
        apellido:String
        email:String
        creado:String
    }
    type Token{
        token:String
    }
    type Producto{
        id: ID
        nombre: String
        precio: Float
        costo:Float
        creado: String
    }
    type Cliente{
        id:ID
        nombre:String
        apellido:String
        empresa:String
        email:String
        telefono:String
        vendedor:ID
    }

    type Pedido{
        id: ID
        pedido: [PedidoGrupo]
        total:Float
        iva:Float
        cliente:Cliente
        vendedor: ID
        pagar:Float
        creado:String
        fechaEntrega:String
        fechaPago:String
        estado: EstadoPedido
        estadoMateriaPrima: EstadoPedido
        fechaPagoMateriaPrima:String
    }
    type PedidoGrupo{
        id:ID
        cantidad: Int
        nombre:String
        precio:Float
        costo:Float
        
    }

    type TopCliente{
        total:Float
        cliente:[Cliente]

    }
    type TopVendedor{
        total:Float
        vendedor:[Usuario]
    }
    type TopVentas{
        total:Float
        pagar:Float
        mes:String
        anio:String
        iva:Float
        impuestos:Float
        
    }

    input UsuarioInput{
        nombre:String!
        apellido:String!
        email:String!
        password:String!
    }
    input AutenticarInput{
        email:String!
        password:String!
    }

    input ProductoInput{
        nombre: String!
        precio: Float!
        costo: Float

    }
    input ClienteInput{
        nombre:String!
        apellido:String
        empresa:String
        email:String
        telefono:String

    }

    input PedidoProductoInput{
        id:ID
        cantidad: Int
        nombre:String
        precio:Float
        costo:Float
        
    }

    input PedidoInput{
        pedido: [PedidoProductoInput]
        total: Float
        iva:Float
        cliente: ID
        pagar: Float
        estado: EstadoPedido
        creado: String
        fechaEntrega:String
        fechaPago:String
        estadoMateriaPrima: EstadoPedido
        fechaPagoMateriaPrima:String
    }
    
    enum EstadoPedido{
        PENDIENTE
        ENTREGADO
        COMPLETADO
        CANCELADO
    }

   type Query{
       #usuarios
       obtenerUsuario: Usuario

       #productos
       obtenerProductos:[Producto]
       obtenerProducto(id:ID!):Producto

       #Clientes
       obtenerClientes:[Cliente]
       obtenerClientesVendedor:[Cliente]
       obtenerCliente(id:ID!): Cliente

       #Pedidos
       obtenerPedidos:[Pedido]
       obtenerPedidosVendedor:[Pedido]
       obtenerPedidosCliente(id:ID!):[Pedido]
       obtenerPedido(id:ID!): Pedido
       obtenerPedidosEstado(estado:String): [Pedido]

       #Busquedas Avanzadas
       mejoresClientes:[TopCliente]
       mejoresVendedores:[TopVendedor]
       buscarProducto(texto:String!):[Producto]
       ventasMensuales:[TopVentas]
   }
   type Mutation{
       # Usuarios
       nuevoUsuario(input:UsuarioInput): Usuario
       autenticarUsuario(input: AutenticarInput):Token

       #Productos
       nuevoProducto(input:ProductoInput): Producto
       actualizarProducto(id:ID!, input: ProductoInput): Producto
       eliminarProducto(id:ID!): String

       #Clientes
       nuevoCliente(input: ClienteInput):Cliente
       actualizarCliente(id:ID!, input:ClienteInput):Cliente
       eliminarCliente(id:ID!):String

       #Pedidos
       nuevoPedido(input: PedidoInput):Pedido
       actualizarPedido(id:ID!, input:PedidoInput ): Pedido
       eliminarPedido(id:ID!):String



   }
   
`;
module.exports = typeDefs;