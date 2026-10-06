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

config.username = process.env.DB_USER || config.username;
config.password = process.env.DB_PASSWORD || config.password;
config.database = process.env.DB_NAME || config.database;
config.host = process.env.DB_HOST || config.host;
config.port = Number(process.env.DB_PORT || config.port);

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

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