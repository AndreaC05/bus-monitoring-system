'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //Relacion de Bus con TipoServicio
      Bus.belongsTo(models.TipoServicio, {
        foreignKey: "id_tipo_servicio",
        as: "tiposervicios",
      });

      //Relacion de Bus con Estado
      Bus.belongsTo(models.Estado, {
        foreignKey: "id_estado",
        as: "estados"
      });

      //Relacion de Bus con Reportes
      Bus.hasMany(models.Reportes, {
        foreignKey: "id_bus",
        as: "reportes",
      });
    }
  }
  Bus.init({
    codigo_bus: DataTypes.STRING,
    capacidad: DataTypes.INTEGER,
    id_tipo_servicio: DataTypes.INTEGER,
    id_estado: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bus',
  });
  return Bus;
};