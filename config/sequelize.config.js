require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelizeConfig = new Sequelize({
  port:process.env.DBPORT,
  username: "devil",
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  dialect: "postgres",
});
module.exports = sequelizeConfig;
