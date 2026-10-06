'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrdenCompras', {
      idOrdenCompra: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      total: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('OrdenCompras');
  }
};
