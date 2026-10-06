import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TipoMedic extends Model {
    static associate(models) {
      TipoMedic.hasMany(models.Medicamento, { foreignKey: 'CodTipoMed' });
    }
  }

  TipoMedic.init({
    CodTipoMed: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descripcion: { type: DataTypes.STRING(120), allowNull: false, unique: true }
  }, { sequelize, modelName: 'TipoMedic', tableName: 'TipoMedics' });

  return TipoMedic;
};
