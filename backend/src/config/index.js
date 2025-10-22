const dotenv = require('dotenv');

dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  // other configurations can be added here
};

module.exports = config;
