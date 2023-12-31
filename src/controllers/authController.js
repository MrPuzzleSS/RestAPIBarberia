const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize } = require('../database/config');
const Usuario = require('../models/usuarios');
const { response } = require('express');

async function iniciarSesion(req, res = response) {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // Verificar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Buscar al usuario por nombre de usuario
    const usuarioEncontrado = await Usuario.findOne({
      where: { nombre_usuario },
    });

    // Verificar si se encontró al usuario
    if (!usuarioEncontrado) {
      res.status(401).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    // Verificar la contraseña del usuario
    if (bcrypt.compareSync(contrasena, usuarioEncontrado.contrasena)) {
      // Generar un token con la información del usuario
      const token = generarToken(usuarioEncontrado);

      // Log del token generado
      console.log('Token generado después de encontrar al usuario:', token);

      // Enviar el token como respuesta
      res.json({ token, userId: usuarioEncontrado.id_usuario });
    } else {
      res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
  } catch (error) {
    // Manejo de errores internos del servidor
    console.error('Error al buscar el usuario:', error);

    // Verificar si el error es específico de Sequelize
    if (error.name === 'SequelizeDatabaseError') {
      // Manejar errores específicos de la base de datos
      res.status(500).json({ mensaje: 'Error en la base de datos' });
    } else {
      // Otros errores internos del servidor
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }
}

// En tu función generarToken del lado del servidor
function generarToken(usuario) {
  const { id_usuario, nombre_usuario, rol } = usuario;
  return jwt.sign({ nombre_usuario, userId: id_usuario, rol }, 'secreto-seguro', { expiresIn: '1h' });
}



module.exports = {
  iniciarSesion,
};
