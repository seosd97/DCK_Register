require('dotenv').config();
const env = process.env;

const development = {
  username: env.DB_USER_NAME,
  password: env.DB_PASSWORD,
  database: env.DB_DEV,
  host: env.DB_HOST || 'localhost',
  port: env.DB_PORT || 3306,
  dialect: env.DB_DIALECT || 'mysql',
};

const test = {
  username: env.DB_USER_NAME,
  password: env.DB_PASSWORD,
  database: env.DB_TEST,
  host: env.DB_HOST || 'mysql',
  port: env.DB_PORT || 3306,
  dialect: env.DB_DIALECT || 'mysql',
};

const production = {
  username: env.DB_USER_NAME_PROD,
  password: env.DB_PASSWORD_PROD,
  database: env.DB_PROD,
  host: env.DB_HOST_PROD,
  port: env.DB_PORT_PROD,
  dialect: env.DB_DIALECT,
};

module.exports = { development, test, production };
