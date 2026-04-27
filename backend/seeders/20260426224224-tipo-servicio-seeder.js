"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    const existingExpreso1 = await queryInterface.rawSelect(
      "TipoServicios",
      {
        where: {
          tiposervicio: "Expreso 1",
        },
      },
      ["id"],
    );

    const existingExpreso12 = await queryInterface.rawSelect(
      "TipoServicios",
      {
        where: {
          tiposervicio: "Expreso 12",
        },
      },
      ["id"],
    );

    const existingRutaB = await queryInterface.rawSelect(
      "TipoServicios",
      {
        where: {
          tiposervicio: "Ruta B",
        },
      },
      ["id"],
    );

    const existingRutaC = await queryInterface.rawSelect(
      "TipoServicios",
      {
        where: {
          tiposervicio: "Ruta C",
        },
      },
      ["id"],
    );


    if (!existingExpreso1) {
      await queryInterface.bulkInsert('TipoServicios', [{
        tiposervicio: 'Expreso 1',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    if (!existingExpreso12) {
      await queryInterface.bulkInsert('TipoServicios', [{
        tiposervicio: 'Expreso 12',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    if (!existingRutaB) {
      await queryInterface.bulkInsert('TipoServicios', [{
        tiposervicio: 'Ruta B',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

     if (!existingRutaC) {
      await queryInterface.bulkInsert('TipoServicios', [{
        tiposervicio: 'Ruta C',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TipoServicios', null, {});
  },
};
