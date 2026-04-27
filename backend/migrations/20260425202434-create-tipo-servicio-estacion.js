'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TipoServicioEstacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_estacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model:"Estacions",
          key: "id"
        }
      },
      id_tipo_servicio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model:"TipoServicios",
          key: "id"
        }
      },
      orden: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TipoServicioEstacions');
  }
};