'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const existingDisponible = await queryInterface.rawSelect(
      "Estados",
      {
        where: {
          estado: "Disponible",
        },
      },
      ["id"],
    );

     const existingCasiLleno = await queryInterface.rawSelect(
      "Estados",
      {
        where: {
          estado: "Casi Lleno",
        },
      },
      ["id"],
    );

    const existingLleno = await queryInterface.rawSelect(
      "Estados",
      {
        where: {
          estado: "Lleno",
        },
      },
      ["id"],
    );

    if (!existingDisponible) {
      await queryInterface.bulkInsert('Estados', [{
        estado: 'Disponible',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

     if (!existingCasiLleno) {
      await queryInterface.bulkInsert('Estados', [{
        estado: 'Casi Lleno',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    if (!existingLleno) {
      await queryInterface.bulkInsert('Estados', [{
        estado: 'Lleno',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.bulkDelete('Estados', null, {});

  }
};
