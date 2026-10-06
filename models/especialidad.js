import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Especialidad extends Model {
    static associate(models) {
      Especialidad.hasMany(models.Medicamento, { foreignKey: 'CodEspec' });
    }
  }

  Especialidad.init({
    CodEspec: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descripcionEsp: { type: DataTypes.STRING(120), allowNull: false, unique: true }
  }, { sequelize, modelName: 'Especialidad', tableName: 'Especialidades' });

  return Especialidad;
};
