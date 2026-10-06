'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Laboratorios', [
      { idLaboratorio: 1, nombre: 'Bayer', pais: 'Alemania', createdAt: new Date(), updatedAt: new Date() },
      { idLaboratorio: 2, nombre: 'Pfizer', pais: 'EE.UU.', createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.bulkInsert('Medicamentos', [
      { idMedicamento: 1, nombre: 'Aspirina 500mg', precio: 12.50, stock: 100, idLaboratorio: 1, createdAt: new Date(), updatedAt: new Date() },
      { idMedicamento: 2, nombre: 'Paracetamol 1g', precio: 8.00, stock: 200, idLaboratorio: 2, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Medicamentos', null, {});
    await queryInterface.bulkDelete('Laboratorios', null, {});
  }
};