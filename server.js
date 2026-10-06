import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './models/index.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres.');
}

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const { DetalleOrdenCompra, DetalleOrdenVta, Especialidad, Laboratorio, Medicamento, OrdenCompra, OrdenVenta, TipoMedic, Usuario } = db;
const resources = {
  laboratorios: {
    model: Laboratorio,
    key: ['CodLab'],
    fields: ['razonSocial', 'direccion', 'telefono', 'email', 'contacto'],
    required: ['razonSocial', 'direccion', 'telefono', 'email', 'contacto'],
    numeric: [],
    date: [],
    columns: ['CodLab', 'razonSocial', 'direccion', 'telefono', 'email', 'contacto']
  },
  especialidades: {
    model: Especialidad,
    key: ['CodEspec'],
    fields: ['descripcionEsp'],
    required: ['descripcionEsp'],
    numeric: [],
    date: [],
    columns: ['CodEspec', 'descripcionEsp']
  },
  'tipos-medicamento': {
    model: TipoMedic,
    key: ['CodTipoMed'],
    fields: ['descripcion'],
    required: ['descripcion'],
    numeric: [],
    date: [],
    columns: ['CodTipoMed', 'descripcion']
  },
  medicamentos: {
    model: Medicamento,
    key: ['CodMedicamento'],
    fields: ['descripcionMed', 'fechaFabricacion', 'fechaVencimiento', 'Presentacion', 'stock', 'precioVentaUni', 'precioVentaPres', 'CodTipoMed', 'Marca', 'CodEspec'],
    required: ['descripcionMed', 'fechaFabricacion', 'fechaVencimiento', 'Presentacion', 'stock', 'precioVentaUni', 'precioVentaPres', 'CodTipoMed', 'Marca', 'CodEspec'],
    numeric: ['stock', 'precioVentaUni', 'precioVentaPres', 'CodTipoMed', 'CodEspec'],
    date: ['fechaFabricacion', 'fechaVencimiento'],
    columns: ['CodMedicamento', 'descripcionMed', 'Presentacion', 'stock', 'precioVentaUni', 'precioVentaPres', 'Marca', 'TipoMedic', 'Especialidad'],
    include: ['TipoMedic', 'Especialidad']
  },
  'ordenes-compra': {
    model: OrdenCompra,
    key: ['NroOrdenC'],
    fields: ['fechaEmision', 'Situacion', 'Total', 'CodLab', 'NrofacturaProv'],
    required: ['fechaEmision', 'Situacion', 'Total', 'CodLab', 'NrofacturaProv'],
    numeric: ['Total', 'CodLab'],
    date: ['fechaEmision'],
    columns: ['NroOrdenC', 'fechaEmision', 'Situacion', 'Total', 'Laboratorio', 'NrofacturaProv'],
    include: ['Laboratorio']
  },
  'detalle-compra': {
    model: DetalleOrdenCompra,
    key: ['NroOrdenC', 'CodMedicamento'],
    fields: ['NroOrdenC', 'CodMedicamento', 'descripcion', 'cantidad', 'precio', 'montouni'],
    required: ['NroOrdenC', 'CodMedicamento', 'descripcion', 'cantidad', 'precio', 'montouni'],
    numeric: ['NroOrdenC', 'CodMedicamento', 'cantidad', 'precio', 'montouni'],
    date: [],
    columns: ['NroOrdenC', 'CodMedicamento', 'descripcion', 'cantidad', 'precio', 'montouni']
  },
  'ordenes-venta': {
    model: OrdenVenta,
    key: ['NroOrdenVta'],
    fields: ['fechaEmision', 'Motivo', 'Situacion'],
    required: ['fechaEmision', 'Motivo', 'Situacion'],
    numeric: [],
    date: ['fechaEmision'],
    columns: ['NroOrdenVta', 'fechaEmision', 'Motivo', 'Situacion']
  },
  'detalle-venta': {
    model: DetalleOrdenVta,
    key: ['NroOrdenVta', 'CodMedicamento'],
    fields: ['NroOrdenVta', 'CodMedicamento', 'descripcionMed', 'cantidadRequerida'],
    required: ['NroOrdenVta', 'CodMedicamento', 'descripcionMed', 'cantidadRequerida'],
    numeric: ['NroOrdenVta', 'CodMedicamento', 'cantidadRequerida'],
    date: [],
    columns: ['NroOrdenVta', 'CodMedicamento', 'descripcionMed', 'cantidadRequerida']
  },
  usuarios: {
    model: Usuario,
    key: ['idUsuario'],
    fields: ['rol'],
    required: ['rol'],
    numeric: [],
    date: [],
    columns: ['idUsuario', 'nombre', 'email', 'rol'],
    adminOnly: true,
    create: false,
    delete: false
  }
};

function publicUser(user) {
  return { idUsuario: user.idUsuario, nombre: user.nombre, email: user.email, rol: user.rol };
}

function sendError(res, error, fallback = 'No se pudo completar la operación.') {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: error.errors?.[0]?.message || 'Los datos no son válidos.' });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
  }
  console.error(error);
  return res.status(500).json({ error: fallback });
}

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Debes iniciar sesión.' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.authUserId = payload.sub;
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'La sesión expiró. Inicia sesión nuevamente.' : 'Token de sesión no válido.';
    return res.status(401).json({ error: message });
  }
}

async function loadCurrentUser(req, res, next) {
  try {
    const user = await Usuario.findByPk(req.authUserId);
    if (!user) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, error, 'No se pudo verificar la cuenta.');
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'No tienes permisos para esta operación.' });
    return next();
  };
}

function validatePayload(body, resource, updating = false) {
  if (!body || Array.isArray(body) || typeof body !== 'object') {
    return { error: 'Envía un objeto JSON válido.' };
  }

  const allowed = updating
    ? (resource.updateFields || resource.fields.filter(field => !resource.key.includes(field)))
    : resource.fields;
  const unexpected = Object.keys(body).filter(key => !allowed.includes(key));
  if (unexpected.length) return { error: `Campos no permitidos: ${unexpected.join(', ')}.` };

  const required = updating ? resource.updateRequired || [] : resource.required;
  const missing = required.filter(key => body[key] === undefined || body[key] === null || body[key] === '');
  if (missing.length) return { error: `Completa los campos requeridos: ${missing.join(', ')}.` };

  const values = { ...body };
  for (const field of resource.numeric) {
    if (values[field] === undefined || values[field] === null || values[field] === '') continue;
    const parsed = Number(values[field]);
    if (!Number.isFinite(parsed) || (['stock', 'CodTipoMed', 'CodEspec', 'CodLab', 'NroOrdenC', 'CodMedicamento', 'NroOrdenVta', 'cantidad', 'cantidadRequerida'].includes(field) && !Number.isInteger(parsed))) {
      return { error: `${field} debe ser numérico${['stock', 'CodTipoMed', 'CodEspec', 'CodLab', 'NroOrdenC', 'CodMedicamento', 'NroOrdenVta', 'cantidad', 'cantidadRequerida'].includes(field) ? ' entero' : ''}.` };
    }
    values[field] = parsed;
  }

  for (const field of resource.date) {
    if (values[field] === undefined || values[field] === null || values[field] === '') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values[field]) || Number.isNaN(Date.parse(`${values[field]}T00:00:00Z`))) {
      return { error: `${field} debe tener el formato YYYY-MM-DD.` };
    }
  }

  if (Object.hasOwn(values, 'email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { error: 'Ingresa un correo electrónico válido.' };
  }
  if (Object.hasOwn(values, 'rol') && !['admin', 'moderador', 'usuario'].includes(values.rol)) {
    return { error: 'El rol seleccionado no es válido.' };
  }
  return { values };
}

function getWhere(resource, id, secondaryId) {
  const ids = secondaryId === undefined ? [id] : [id, secondaryId];
  if (ids.length !== resource.key.length || ids.some(value => !/^\d+$/.test(String(value)))) return null;
  return Object.fromEntries(resource.key.map((key, index) => [key, Number(ids[index])]));
}

app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, rol: requestedRole } = req.body || {};
  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 120) {
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 120 caracteres.' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 72 caracteres.' });
  }
  if (requestedRole !== undefined && !['admin', 'moderador', 'usuario'].includes(requestedRole)) {
    return res.status(400).json({ error: 'Selecciona un rol válido: administrador, moderador o usuario.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Usuario.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

    const user = await Usuario.create({
      nombre: nombre.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      rol: requestedRole || 'usuario'
    });
    const token = jwt.sign({}, jwtSecret, { subject: String(user.idUsuario), expiresIn: '1h' });
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    return sendError(res, error, 'No se pudo crear la cuenta.');
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Ingresa correo y contraseña.' });
  }

  try {
    const user = await Usuario.unscoped().findOne({ where: { email: email.trim().toLowerCase() } });
    const validPassword = user && await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const token = jwt.sign({}, jwtSecret, { subject: String(user.idUsuario), expiresIn: '1h' });
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    return sendError(res, error, 'No se pudo iniciar sesión.');
  }
});

app.get('/api/auth/me', requireAuth, loadCurrentUser, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/:resource', requireAuth, loadCurrentUser, (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource) return res.status(404).json({ error: 'Recurso no encontrado.' });
  if (resource.adminOnly && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo un administrador puede administrar usuarios.' });
  }
  if (req.user.rol === 'usuario' && req.params.resource !== 'medicamentos') {
    return res.status(403).json({ error: 'Tu rol solo permite consultar medicamentos.' });
  }
  req.resource = resource;
  return next();
});

app.get('/api/:resource', async (req, res) => {
  try {
    const include = (req.resource.include || []).map(alias => ({ association: alias }));
    const rows = await req.resource.model.findAll({ include });
    return res.json(rows);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/:resource', authorize('admin', 'moderador'), async (req, res) => {
  if (req.resource.create === false) return res.status(405).json({ error: 'No se permite crear este tipo de registro.' });
  const validation = validatePayload(req.body, req.resource);
  if (validation.error) return res.status(400).json({ error: validation.error });
  try {
    const row = await req.resource.model.create(validation.values);
    return res.status(201).json(row);
  } catch (error) {
    return sendError(res, error);
  }
});

async function updateResource(req, res) {
  if (req.resource.update === false) return res.status(405).json({ error: 'No se permite editar este tipo de registro.' });
  const where = getWhere(req.resource, req.params.id, req.params.secondaryId);
  if (!where) return res.status(400).json({ error: 'Identificador de registro no válido.' });
  const validation = validatePayload(req.body, req.resource, true);
  if (validation.error) return res.status(400).json({ error: validation.error });
  try {
    const row = await req.resource.model.findOne({ where });
    if (!row) return res.status(404).json({ error: 'Registro no encontrado.' });
    await row.update(validation.values);
    return res.json(row);
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteResource(req, res) {
  if (req.resource.delete === false) return res.status(405).json({ error: 'No se permite eliminar este tipo de registro.' });
  const where = getWhere(req.resource, req.params.id, req.params.secondaryId);
  if (!where) return res.status(400).json({ error: 'Identificador de registro no válido.' });
  try {
    const row = await req.resource.model.findOne({ where });
    if (!row) return res.status(404).json({ error: 'Registro no encontrado.' });
    await row.destroy();
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error);
  }
}

app.put('/api/:resource/:id', authorize('admin', 'moderador'), updateResource);
app.put('/api/:resource/:id/:secondaryId', authorize('admin', 'moderador'), updateResource);
app.delete('/api/:resource/:id', authorize('admin', 'moderador'), deleteResource);
app.delete('/api/:resource/:id/:secondaryId', authorize('admin', 'moderador'), deleteResource);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

async function start() {
  await db.sequelize.authenticate();
  app.listen(port, () => console.log(`Servidor activo en http://localhost:${port}`));
}

start().catch(error => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exitCode = 1;
});
