'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reportes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //Relacion de Reportes con Bus
      Reportes.belongsTo(models.Bus, {
        foreignKey: "id_bus",
        as: "buses",
      });
    }
  }
  Reportes.init({
    id_bus: DataTypes.INTEGER,
    latitud: DataTypes.FLOAT,
    longitud: DataTypes.FLOAT,
    cantidad_pasajeros: DataTypes.INTEGER,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Reportes',
  });
  return Reportes;
};