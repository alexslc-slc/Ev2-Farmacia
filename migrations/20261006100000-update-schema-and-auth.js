'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Especialidades', {
      CodEspec: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      descripcionEsp: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.createTable('TipoMedics', {
      CodTipoMed: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      descripcion: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    for (const [name, type] of [
      ['direccion', Sequelize.STRING(200)],
      ['telefono', Sequelize.STRING(30)],
      ['email', Sequelize.STRING(150)],
      ['contacto', Sequelize.STRING(120)]
    ]) {
      await queryInterface.addColumn('Laboratorios', name, { type, allowNull: true });
    }

    for (const [name, type] of [
      ['fechaFabricacion', Sequelize.DATEONLY],
      ['fechaVencimiento', Sequelize.DATEONLY],
      ['Presentacion', Sequelize.STRING(100)],
      ['precioVentaPres', Sequelize.DECIMAL(10, 2)],
      ['Marca', Sequelize.STRING(100)],
      ['CodTipoMed', Sequelize.INTEGER],
      ['CodEspec', Sequelize.INTEGER]
    ]) {
      await queryInterface.addColumn('Medicamentos', name, { type, allowNull: true });
    }
    await queryInterface.addConstraint('Medicamentos', {
      fields: ['CodTipoMed'],
      type: 'foreign key',
      name: 'fk_medicamento_tipo',
      references: { table: 'TipoMedics', field: 'CodTipoMed' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('Medicamentos', {
      fields: ['CodEspec'],
      type: 'foreign key',
      name: 'fk_medicamento_especialidad',
      references: { table: 'Especialidades', field: 'CodEspec' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('OrdenCompras', 'Situacion', { type: Sequelize.STRING(40), allowNull: true });
    await queryInterface.addColumn('OrdenCompras', 'CodLab', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('OrdenCompras', 'NrofacturaProv', { type: Sequelize.STRING(60), allowNull: true });
    await queryInterface.addConstraint('OrdenCompras', {
      fields: ['CodLab'],
      type: 'foreign key',
      name: 'fk_ordencompra_laboratorio',
      references: { table: 'Laboratorios', field: 'idLaboratorio' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('DetalleOrdenCompras', 'descripcion', { type: Sequelize.STRING(180), allowNull: true });
    await queryInterface.addColumn('DetalleOrdenCompras', 'montouni', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addIndex('DetalleOrdenCompras', ['idOrdenCompra', 'idMedicamento'], {
      name: 'idx_detalle_ordencompra_medicamento'
    });

    await queryInterface.createTable('OrdenVentas', {
      NroOrdenVta: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      fechaEmision: { type: Sequelize.DATEONLY, allowNull: false },
      Motivo: { type: Sequelize.STRING(200), allowNull: false },
      Situacion: { type: Sequelize.STRING(40), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.createTable('DetalleOrdenVtas', {
      NroOrdenVta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'OrdenVentas', key: 'NroOrdenVta' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      CodMedicamento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'Medicamentos', key: 'idMedicamento' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      descripcionMed: { type: Sequelize.STRING(180), allowNull: false },
      cantidadRequerida: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('Usuarios', {
      idUsuario: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING(100), allowNull: false },
      rol: { type: Sequelize.ENUM('admin', 'moderador', 'usuario'), allowNull: false, defaultValue: 'usuario' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Usuarios');
    await queryInterface.dropTable('DetalleOrdenVtas');
    await queryInterface.dropTable('OrdenVentas');
    await queryInterface.removeIndex('DetalleOrdenCompras', 'idx_detalle_ordencompra_medicamento');
    await queryInterface.removeColumn('DetalleOrdenCompras', 'montouni');
    await queryInterface.removeColumn('DetalleOrdenCompras', 'descripcion');
    await queryInterface.removeConstraint('OrdenCompras', 'fk_ordencompra_laboratorio');
    await queryInterface.removeColumn('OrdenCompras', 'NrofacturaProv');
    await queryInterface.removeColumn('OrdenCompras', 'CodLab');
    await queryInterface.removeColumn('OrdenCompras', 'Situacion');
    await queryInterface.removeConstraint('Medicamentos', 'fk_medicamento_especialidad');
    await queryInterface.removeConstraint('Medicamentos', 'fk_medicamento_tipo');
    for (const name of ['CodEspec', 'CodTipoMed', 'Marca', 'precioVentaPres', 'Presentacion', 'fechaVencimiento', 'fechaFabricacion']) {
      await queryInterface.removeColumn('Medicamentos', name);
    }
    for (const name of ['contacto', 'email', 'telefono', 'direccion']) {
      await queryInterface.removeColumn('Laboratorios', name);
    }
    await queryInterface.dropTable('TipoMedics');
    await queryInterface.dropTable('Especialidades');
  }
};
