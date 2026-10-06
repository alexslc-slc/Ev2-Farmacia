'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DetalleOrdenCompras', {
      idDetalle: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idOrdenCompra: {
        type: Sequelize.INTEGER,
        references: { model: 'OrdenCompras', key: 'idOrdenCompra' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idMedicamento: {
        type: Sequelize.INTEGER,
        references: { model: 'Medicamentos', key: 'idMedicamento' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: { type: Sequelize.INTEGER, allowNull: false },
      precioUnitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('DetalleOrdenCompras');
  }
};
