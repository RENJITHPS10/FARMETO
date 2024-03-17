const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../../config/sequelize.config");

const loginModel = sequelizeConfig.define("buyerlogin", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name:{
    type: DataTypes.STRING,
    allowNull: false,
  },
saved:{
    type:DataTypes.ARRAY(DataTypes.STRING),
    allowNull:true
  },
  
});


module.exports=loginModel