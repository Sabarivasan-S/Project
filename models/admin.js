'use strict';
const {
  Model
} = require('sequelize');
const bcrypt=require('bcrypt')
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Admin.init({
    adminname: {
      type:DataTypes.STRING,
      primaryKey:true,
      
    },
    password: {
      type:DataTypes.STRING,
      set(value){
        let hash=bcrypt.hashSync(value,10);
        this.setDataValue('password',hash);
      }
    }
}, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};