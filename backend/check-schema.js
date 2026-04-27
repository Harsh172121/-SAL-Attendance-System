require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize } = require('./config/db');
const { ensureSchema } = require('./utils/ensureSchema');
(async () => {
  await sequelize.authenticate();
  await ensureSchema(sequelize);

  process.exit(0);
})();
