const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../../config/sequelize.config");

const adminlogin = sequelizeConfig.define( "adminlogin",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);

module.exports = adminlogin;