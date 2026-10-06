'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Medicamentos', {
      idMedicamento: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: { type: Sequelize.STRING, allowNull: false },
      precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      idLaboratorio: {
        type: Sequelize.INTEGER,
        references: { model: 'Laboratorios', key: 'idLaboratorio' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Medicamentos');
  }
};
