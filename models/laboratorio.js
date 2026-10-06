import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Laboratorio extends Model {
    static associate(models) {
      Laboratorio.hasMany(models.OrdenCompra, { foreignKey: 'CodLab' });
    }
  }

  Laboratorio.init({
    CodLab: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'idLaboratorio' },
    razonSocial: { type: DataTypes.STRING(150), allowNull: false, field: 'nombre' },
    direccion: { type: DataTypes.STRING(200), allowNull: false },
    telefono: { type: DataTypes.STRING(30), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
    contacto: { type: DataTypes.STRING(120), allowNull: false }
  }, { sequelize, modelName: 'Laboratorio', tableName: 'Laboratorios' });

  return Laboratorio;
};
