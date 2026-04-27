'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoServicioEstacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //Relacion de TipoServicioEstacion con Estacion
      TipoServicioEstacion.belongsTo(models.Estacion, {
        foreignKey: "id_estacion",
        as: "estaciones"
      });

      //Relacion de TipoServicioEstacion con TipoServicio
      TipoServicioEstacion.belongsTo(models.TipoServicio, {
        foreignKey: "id_tipo_servicio",
        as: "tiposervicios"
      });
    }
  }
  TipoServicioEstacion.init({
    id_estacion: DataTypes.INTEGER,
    id_tipo_servicio: DataTypes.FLOAT,
    orden: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TipoServicioEstacion',
  });
  return TipoServicioEstacion;
};