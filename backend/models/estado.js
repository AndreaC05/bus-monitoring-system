'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Estado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //Relacion de Estado con Bus
       Estado.hasMany(models.Bus, {
        foreignKey: "id_estado",
        as: "buses",
      });
    }
  }
  Estado.init({
    estado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Estado',
  });
  return Estado;
};