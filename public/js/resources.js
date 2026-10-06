export const resources = {
  medicamentos: {
    title: 'Medicamentos',
    description: 'Inventario: descripción, presentación, precios y clasificación.',
    optionLabel: 'descripcionMed',
    key: ['CodMedicamento'],
    columns: ['CodMedicamento', 'descripcionMed', 'Presentacion', 'stock', 'precioVentaUni', 'precioVentaPres', 'Marca', 'TipoMedic', 'Especialidad'],
    fields: [
      { name: 'descripcionMed', label: 'Descripción', maxLength: 180, wide: true },
      { name: 'fechaFabricacion', label: 'Fecha de fabricación', type: 'date' },
      { name: 'fechaVencimiento', label: 'Fecha de vencimiento', type: 'date' },
      { name: 'Presentacion', label: 'Presentación', maxLength: 100, wide: true },
      { name: 'stock', label: 'Stock', type: 'number', min: 0, step: 1 },
      { name: 'precioVentaUni', label: 'Precio por unidad', type: 'number', min: 0, step: '0.01' },
      { name: 'precioVentaPres', label: 'Precio por presentación', type: 'number', min: 0, step: '0.01' },
      { name: 'CodTipoMed', label: 'Tipo de medicamento', resource: 'tipos-medicamento' },
      { name: 'Marca', label: 'Marca', maxLength: 100 },
      { name: 'CodEspec', label: 'Especialidad', resource: 'especialidades' }
    ]
  },
  laboratorios: {
    title: 'Laboratorios',
    description: 'Datos de contacto de los laboratorios proveedores.',
    optionLabel: 'razonSocial',
    key: ['CodLab'],
    columns: ['CodLab', 'razonSocial', 'direccion', 'telefono', 'email', 'contacto'],
    fields: [
      { name: 'razonSocial', label: 'Razón social', maxLength: 150 },
      { name: 'direccion', label: 'Dirección', maxLength: 200, wide: true },
      { name: 'telefono', label: 'Teléfono', maxLength: 30 },
      { name: 'email', label: 'Correo electrónico', type: 'email', maxLength: 150 },
      { name: 'contacto', label: 'Persona de contacto', maxLength: 120 }
    ]
  },
  especialidades: {
    title: 'Especialidades',
    description: 'Catálogo de especialidades para clasificar medicamentos.',
    optionLabel: 'descripcionEsp',
    key: ['CodEspec'],
    columns: ['CodEspec', 'descripcionEsp'],
    fields: [{ name: 'descripcionEsp', label: 'Descripción', maxLength: 120 }]
  },
  'tipos-medicamento': {
    title: 'Tipos de medicamento',
    description: 'Catálogo de tipos de medicamento.',
    optionLabel: 'descripcion',
    key: ['CodTipoMed'],
    columns: ['CodTipoMed', 'descripcion'],
    fields: [{ name: 'descripcion', label: 'Descripción', maxLength: 120 }]
  },
  'ordenes-compra': {
    title: 'Órdenes de compra',
    description: 'Órdenes de compra emitidas a laboratorios.',
    optionLabel: 'fechaEmision',
    key: ['NroOrdenC'],
    columns: ['NroOrdenC', 'fechaEmision', 'Situacion', 'Total', 'Laboratorio', 'NrofacturaProv'],
    fields: [
      { name: 'fechaEmision', label: 'Fecha de emisión', type: 'date' },
      { name: 'Situacion', label: 'Situación', maxLength: 40 },
      { name: 'Total', label: 'Total', type: 'number', min: 0, step: '0.01' },
      { name: 'CodLab', label: 'Laboratorio', resource: 'laboratorios' },
      { name: 'NrofacturaProv', label: 'N.º de factura del proveedor', maxLength: 60, wide: true }
    ]
  },
  'detalle-compra': {
    title: 'Detalles de compra',
    description: 'Medicamentos y cantidades asociadas a cada compra.',
    key: ['NroOrdenC', 'CodMedicamento'],
    columns: ['NroOrdenC', 'CodMedicamento', 'descripcion', 'cantidad', 'precio', 'montouni'],
    fields: [
      { name: 'NroOrdenC', label: 'Orden de compra', resource: 'ordenes-compra' },
      { name: 'CodMedicamento', label: 'Medicamento', resource: 'medicamentos' },
      { name: 'descripcion', label: 'Descripción', maxLength: 180, wide: true },
      { name: 'cantidad', label: 'Cantidad', type: 'number', min: 1, step: 1 },
      { name: 'precio', label: 'Precio unitario', type: 'number', min: 0, step: '0.01' },
      { name: 'montouni', label: 'Monto total', helpText: 'Cantidad × precio unitario', type: 'number', min: 0, step: '0.01' }
    ]
  },
  'ordenes-venta': {
    title: 'Órdenes de venta',
    description: 'Órdenes de salida de medicamentos.',
    optionLabel: 'Motivo',
    key: ['NroOrdenVta'],
    columns: ['NroOrdenVta', 'fechaEmision', 'Motivo', 'Situacion'],
    fields: [
      { name: 'fechaEmision', label: 'Fecha de emisión', type: 'date' },
      { name: 'Motivo', label: 'Motivo', maxLength: 200, wide: true },
      { name: 'Situacion', label: 'Situación', maxLength: 40 }
    ]
  },
  'detalle-venta': {
    title: 'Detalles de venta',
    description: 'Medicamentos y cantidades asociadas a cada venta.',
    key: ['NroOrdenVta', 'CodMedicamento'],
    columns: ['NroOrdenVta', 'CodMedicamento', 'descripcionMed', 'cantidadRequerida'],
    fields: [
      { name: 'NroOrdenVta', label: 'Orden de venta', resource: 'ordenes-venta' },
      { name: 'CodMedicamento', label: 'Medicamento', resource: 'medicamentos' },
      { name: 'descripcionMed', label: 'Descripción', maxLength: 180, wide: true },
      { name: 'cantidadRequerida', label: 'Cantidad requerida', type: 'number', min: 1, step: 1 }
    ]
  },
  usuarios: {
    title: 'Usuarios y roles',
    description: 'El registro público crea cuentas con rol usuario. Asigna aquí permisos elevados.',
    key: ['idUsuario'],
    columns: ['idUsuario', 'nombre', 'email', 'rol'],
    fields: [{ name: 'rol', label: 'Rol', options: ['usuario', 'moderador', 'admin'] }]
  }
};

export const menuOrder = [
  'medicamentos',
  'laboratorios',
  'especialidades',
  'tipos-medicamento',
  'ordenes-compra',
  'detalle-compra',
  'ordenes-venta',
  'detalle-venta',
  'usuarios'
];
