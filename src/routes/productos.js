const { Router } = require('express');
const route = Router();

const { getProductos, getProducto, postProducto, putProducto, deleteProducto,  obtenerProveedores } = require('../controllers/productos');

route.get('/producto', getProductos);
route.get('/producto-proveedores', obtenerProveedores);
route.get('/producto/:id', getProducto);
route.post('/producto', postProducto);
route.put('/producto/:id', putProducto);
route.delete('/producto/:id', deleteProducto);

module.exports = route;
