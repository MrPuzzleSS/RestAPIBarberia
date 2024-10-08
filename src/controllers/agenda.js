const Agenda = require('../models/agenda');
const { response } = require('express');
const Empleado = require('../models/empleados');
const moment = require('moment');

const getAgendas = async (req, res = response) => {
    try {
        // Consulta SQL para obtener las agendas ordenadas por fecha de inicio
        const agendas = await Agenda.findAll({
            order: [
                ['fechaInicio', 'ASC'] // Ordenar por fecha de inicio en orden ascendente
            ]
        });

        // Formatear las fechas antes de enviarlas como respuesta
        const formattedAgendas = agendas.map(agenda => ({
            id_agenda: agenda.id_agenda,
            id_empleado: agenda.id_empleado,
            motivo: agenda.motivo,
            fechaInicio: moment(agenda.fechaInicio).format('YYYY-MM-DD HH:mm:ss'),
            fechaFin: moment(agenda.fechaFin).format('YYYY-MM-DD HH:mm:ss'),
            horaInicio: agenda.horaInicio,
            horaFin: agenda.horaFin,
            estado: agenda.estado,
            createdAt: moment(agenda.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(agenda.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.json({ agendas: formattedAgendas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener elementos de Agenda' });
    }
};



const getAgendasActivas = async (req, res = response) => {
    try {
        const agendas = await Agenda.findAll({where: { estado: true}});
        res.json({ agendas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener elementos de Agenda' });
    }
};

const getAgendaEmpleado = async (req, res = response) => {
    const { id } = req.params;

    try {
        // Busca la agenda por ID junto con los datos del empleado asociado
        const agenda = await Agenda.findByPk(id, {
            include: [{
                model: Empleado, // Modelo de empleado
                attributes: ['id_empleado', 'nombre', 'apellido', 'correo', 'documento', 'telefono', 'estado'], // Selecciona los campos que deseas obtener
                where: {
                    estado: 'Activo' // Filtra solo los empleados con estado 'Activo'
                }
            }],
        });

        if (agenda) {
            res.json(agenda);
        } else {
            res.status(404).json({ error: `No se encontró un elemento de Agenda con ID ${id}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el elemento de Agenda con datos de empleado' });
    }
};

const getAgenda = async (req, res = response) => {
    const { id } = req.params;

    try {
        const agenda = await Agenda.findByPk(id);

        if (agenda) {
            res.json(agenda);
        } else {
            res.status(404).json({ error: `No se encontró un elemento de Agenda con ID ${id}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el elemento de Agenda' });
    }
};

const putAgenda = async (req, res = response) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const agenda = await Agenda.findByPk(id);

        if (agenda) {
            await agenda.update(updatedData);
            res.json({
                msg: `El elemento de Agenda fue actualizado exitosamente.`
            });
        } else {
            res.status(404).json({ error: `No se encontró un elemento de Agenda con ID ${id}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el elemento de Agenda el empleado ya se encuentra en horas que se solapan' });
    }
};

const postAgenda = async (req, res = response) => {
    const newEntryData = req.body;

    try {
        const createdAgendaItem = await Agenda.create(newEntryData);
        console.log('Guardado con éxito', newEntryData);
        // Enviar una respuesta con un campo indicando el éxito y la agenda creada
        res.status(201).json({ success: true, message: 'Agenda guardada exitosamente', agenda: createdAgendaItem });
    } catch (error) {
        console.error(error);

        // Manejar el error de validación de Sequelize
        if (error.name === 'SequelizeValidationError') {
            // Si el error es de validación de Sequelize, es probable que sea debido a la superposición de horarios
            res.status(400).json({ success: false, error: 'Ya existe un evento que se superpone en fechas y horas para este empleado.' });
        } else {
            // Si el error no es de validación de Sequelize, devolver un mensaje de error genérico
            res.status(400).json({ success: false, error: 'Error al crear un elemento de Agenda' });
        }
    }
};




const deleteAgenda = async (req, res = response) => {
    const { id } = req.params;

    try {
        const agenda = await Agenda.findByPk(id);

        if (agenda) {
            await agenda.destroy();
            res.json('Elemento de Agenda eliminado exitosamente');
        } else {
            res.status(404).json({ error: `No se encontró un elemento de Agenda con ID ${id}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el elemento de Agenda' });
    }


};

let validateFechaHoraUnica = true; // Bandera para habilitar o deshabilitar la validación

const disableEvent = async (req, res) => {
    const { id } = req.params;
    const { motivo, newEstado } = req.body;

    console.log('ID del evento a deshabilitar:', id);
    console.log('Motivo:', motivo);
    console.log('estado:', newEstado);

    try {
        if (validateFechaHoraUnica) {
            // Desactivar temporalmente la validación fechaHoraUnica
            validateFechaHoraUnica = false;
        }

        const agenda = await Agenda.findByPk(id);

        if (!agenda) {
            return res.status(404).json({ error: `No se encontró un evento de Agenda con ID ${id}` });
        }

        // Actualizar el estado y el motivo en la base de datos
        await agenda.update({ estado: !newEstado, motivo });

        // Volver a activar la validación fechaHoraUnica después de completar la operación
        validateFechaHoraUnica = true;

        res.json({
            msg: `El evento de Agenda con ID ${id} ha sido deshabilitado con motivo: ${motivo}`,
        });
    } catch (error) {
        console.error('Error al deshabilitar el evento:', error);
        // Asegúrate de volver a activar la validación fechaHoraUnica en caso de error
        validateFechaHoraUnica = true;
        res.status(500).json({ error: 'Error al deshabilitar el evento de Agenda' });
    }
};

module.exports = {
    getAgendasActivas,
    disableEvent,
    getAgenda,
    getAgendas,
    getAgendaEmpleado,
    postAgenda,
    putAgenda,
    deleteAgenda
};
