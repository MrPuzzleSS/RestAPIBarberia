const { Router } = require('express');
const route = Router();

const { getAgenda, getAgendas, getAgendaEmpleado, postAgenda, putAgenda, deleteAgenda,disableEvent} = require('../controllers/agenda');

route.get('/agenda', getAgendas);
route.get('/agenda/empleado/:id', getAgendaEmpleado);
route.get('/agenda/:id', getAgenda);
route.post('/agenda', postAgenda);
route.put('/agenda/:id', putAgenda);
route.delete('/agenda/:id', deleteAgenda);
route.put('/agenda/:id/disabled', disableEvent);



module.exports = route;
