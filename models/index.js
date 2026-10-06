import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[env];
if (!config) throw new Error(`No existe configuración de base de datos para NODE_ENV=${env}`);

const databaseUrl = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL === 'true';
const databaseOptions = {
  ...config,
  dialect: 'postgres',
  ...(useSsl ? { dialectOptions: { ssl: { rejectUnauthorized: true } } } : {})
};

const db = {};
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, databaseOptions)
  : new Sequelize(
      process.env.DB_NAME || config.database,
      process.env.DB_USER || config.username,
      process.env.DB_PASSWORD || config.password,
      {
        ...databaseOptions,
        host: process.env.DB_HOST || config.host,
        port: Number(process.env.DB_PORT || config.port)
      }
    );

const files = fs.readdirSync(__dirname).filter(file => {
  return file.indexOf('.') !== 0 && file !== path.basename(__filename) && file.slice(-3) === '.js';
});

for (const file of files) {
  const modelModule = await import(`./${file}`);
  const model = modelModule.default(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;