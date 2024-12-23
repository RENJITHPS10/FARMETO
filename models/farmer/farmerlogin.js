const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../../config/sequelize.config");
const productModel = require("../farmer/product");

const loginModel = sequelizeConfig.define("farmerlogin", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  pincode: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  houseNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  proof: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

loginModel.associate = () => {
  loginModel.hasMany(productModel, { foreignKey: "farmerId" });
};

module.exports = loginModel;
