import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const {
  DetalleOrdenCompra,
  DetalleOrdenVta,
  Especialidad,
  Laboratorio,
  Medicamento,
  OrdenCompra,
  OrdenVenta,
  TipoMedic,
  Usuario
} = db;

async function seed() {
  await db.sequelize.authenticate();

  const [laboratorio] = await Laboratorio.findOrCreate({
    where: { razonSocial: 'Laboratorios Demo S.A.' },
    defaults: {
      direccion: 'Av. Salud 123',
      telefono: '555-0101',
      email: 'contacto@example.com',
      contacto: 'Equipo de demostración'
    }
  });
  const [tipo] = await TipoMedic.findOrCreate({
    where: { descripcion: 'Analgésico' }
  });
  const [especialidad] = await Especialidad.findOrCreate({
    where: { descripcionEsp: 'Medicina general' }
  });
  const [medicamento] = await Medicamento.findOrCreate({
    where: { descripcionMed: 'Paracetamol 500 mg' },
    defaults: {
      fechaFabricacion: '2025-01-01',
      fechaVencimiento: '2030-01-01',
      Presentacion: 'Caja x 20 tabletas',
      stock: 200,
      precioVentaUni: 0.5,
      precioVentaPres: 10,
      CodTipoMed: tipo.CodTipoMed,
      Marca: 'Genérico',
      CodEspec: especialidad.CodEspec
    }
  });
  const [ordenCompra] = await OrdenCompra.findOrCreate({
    where: { NrofacturaProv: 'DEMO-COMPRA-001' },
    defaults: {
      fechaEmision: '2026-01-15',
      Situacion: 'Recibida',
      Total: 10,
      CodLab: laboratorio.CodLab
    }
  });
  await DetalleOrdenCompra.findOrCreate({
    where: { NroOrdenC: ordenCompra.NroOrdenC, CodMedicamento: medicamento.CodMedicamento },
    defaults: {
      descripcion: medicamento.descripcionMed,
      cantidad: 20,
      precio: 0.5,
      montouni: 10
    }
  });

  const [ordenVenta] = await OrdenVenta.findOrCreate({
    where: { Motivo: 'Venta de demostración' },
    defaults: {
      fechaEmision: '2026-01-16',
      Situacion: 'Completada'
    }
  });
  await DetalleOrdenVta.findOrCreate({
    where: { NroOrdenVta: ordenVenta.NroOrdenVta, CodMedicamento: medicamento.CodMedicamento },
    defaults: {
      descripcionMed: medicamento.descripcionMed,
      cantidadRequerida: 2
    }
  });

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const [admin, created] = await Usuario.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      defaults: {
        nombre: process.env.ADMIN_NAME || 'Administrador',
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        rol: 'admin'
      }
    });
    console.log(created ? `Cuenta administradora creada: ${admin.email}` : `La cuenta ${admin.email} ya existe; no se modificó.`);
  } else {
    console.log('No se creó administrador: configura ADMIN_EMAIL y ADMIN_PASSWORD para habilitarlo.');
  }

  console.log('Datos de demostración cargados.');
}

seed()
  .catch(error => {
    console.error('Error al cargar datos iniciales:', error);
    process.exitCode = 1;
  })
  .finally(() => db.sequelize.close());
