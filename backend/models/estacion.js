'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Estacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //Relacion de Estacion con TipoServicioEstacion
      Estacion.hasMany(models.TipoServicioEstacion, {
        foreignKey: "id_estacion",
        as: "tiposerviciosestaciones",
      });
    }
  }
  Estacion.init({
    estaciones: DataTypes.STRING,
    latitud_estacion: DataTypes.FLOAT,
    longitud_estacion: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Estacion',
  });
  return Estacion;
};