import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrdenVenta extends Model {
    static associate(models) {
      OrdenVenta.belongsToMany(models.Medicamento, {
        through: models.DetalleOrdenVta,
        foreignKey: 'NroOrdenVta',
        otherKey: 'CodMedicamento'
      });
    }
  }

  OrdenVenta.init({
    NroOrdenVta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
    Motivo: { type: DataTypes.STRING(200), allowNull: false },
    Situacion: { type: DataTypes.STRING(40), allowNull: false }
  }, { sequelize, modelName: 'OrdenVenta', tableName: 'OrdenVentas' });

  return OrdenVenta;
};
