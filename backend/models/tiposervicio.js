"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TipoServicio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Relacion de TipoServicio con Bus
      TipoServicio.hasMany(models.Bus, {
        foreignKey: "id_tipo_servicio",
        as: "buses",
      });

      //Relacion de TipoServicio con TipoServicioEstacion
      TipoServicio.hasMany(models.TipoServicioEstacion, {
        foreignKey: "id_tipo_servicio",
        as: "tiposerviciosestaciones",
      });

    }
  }
  TipoServicio.init(
    {
      tiposervicio: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TipoServicio",
    },
  );
  return TipoServicio;
};
