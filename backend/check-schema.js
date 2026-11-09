require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize } = require('./config/db');
const { ensureSchema } = require('./utils/ensureSchema');
(async () => {
  try {
    await sequelize.authenticate();
    await ensureSchema(sequelize);
  } finally {
    await sequelize.close();
  }
})();
