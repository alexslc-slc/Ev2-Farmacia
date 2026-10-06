import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import db from '../models/index.js';

const migrationsDirectory = fileURLToPath(new URL('../migrations/', import.meta.url));
const queryInterface = db.sequelize.getQueryInterface();

async function migrate() {
  await db.sequelize.authenticate();
  const tables = await queryInterface.showAllTables();
  const hasMetaTable = tables.some(table => String(table).toLowerCase() === 'sequelizemeta');

  if (!hasMetaTable) {
    await queryInterface.createTable('SequelizeMeta', {
      name: { type: db.Sequelize.STRING, allowNull: false, primaryKey: true }
    });
  }

  const [appliedRows] = await db.sequelize.query('SELECT name FROM SequelizeMeta');
  const applied = new Set(appliedRows.map(row => row.name));
  const files = (await fs.readdir(migrationsDirectory))
    .filter(file => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const migrationUrl = pathToFileURL(path.join(migrationsDirectory, file)).href;
    const migration = (await import(migrationUrl)).default;
    if (typeof migration?.up !== 'function') {
      throw new Error(`La migración ${file} no exporta una función up válida.`);
    }

    console.log(`Ejecutando ${file}...`);
    await migration.up(queryInterface, db.Sequelize);
    await queryInterface.bulkInsert('SequelizeMeta', [{ name: file }]);
  }

  console.log('Migraciones aplicadas correctamente.');
}

migrate()
  .catch(error => {
    console.error('Error al ejecutar migraciones:', error);
    process.exitCode = 1;
  })
  .finally(() => db.sequelize.close());
