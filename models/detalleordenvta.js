import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DetalleOrdenVta extends Model {
    static associate(models) {
      DetalleOrdenVta.belongsTo(models.OrdenVenta, { foreignKey: 'NroOrdenVta' });
      DetalleOrdenVta.belongsTo(models.Medicamento, { foreignKey: 'CodMedicamento' });
    }
  }

  DetalleOrdenVta.init({
    NroOrdenVta: { type: DataTypes.INTEGER, primaryKey: true },
    CodMedicamento: { type: DataTypes.INTEGER, primaryKey: true },
    descripcionMed: { type: DataTypes.STRING(180), allowNull: false },
    cantidadRequerida: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } }
  }, { sequelize, modelName: 'DetalleOrdenVta', tableName: 'DetalleOrdenVtas' });

  return DetalleOrdenVta;
};
