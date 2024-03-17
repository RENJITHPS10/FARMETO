const { DataTypes } = require('sequelize');
const sequelizeConfig = require('../../config/sequelize.config');
const farmerlogin = require("../../models/farmer/farmerlogin");

const productModel = sequelizeConfig.define('product', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    farmerId: {
        type: DataTypes.STRING,
        allowNull: false,
    } ,
    contactNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.INTEGER,
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
      }
});

productModel.associate = () => {
    productModel.belongsTo(farmerlogin, { foreignKey: "farmerId" });
};

module.exports = productModel;
