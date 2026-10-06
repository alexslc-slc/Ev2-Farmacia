'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Laboratorios', {
      idLaboratorio: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: { type: Sequelize.STRING, allowNull: false },
      pais: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Laboratorios');
  }
};
