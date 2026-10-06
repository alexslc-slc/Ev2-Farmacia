import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrdenCompra extends Model {
    static associate(models) {
      OrdenCompra.belongsTo(models.Laboratorio, { foreignKey: 'CodLab' });
      OrdenCompra.belongsToMany(models.Medicamento, {
        through: models.DetalleOrdenCompra,
        foreignKey: 'NroOrdenC',
        otherKey: 'CodMedicamento'
      });
    }
  }

  OrdenCompra.init({
    NroOrdenC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'idOrdenCompra' },
    fechaEmision: { type: DataTypes.DATEONLY, allowNull: true, field: 'fecha' },
    Situacion: { type: DataTypes.STRING(40), allowNull: true },
    Total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0, validate: { min: 0 }, field: 'total' },
    CodLab: { type: DataTypes.INTEGER, allowNull: true },
    NrofacturaProv: { type: DataTypes.STRING(60), allowNull: true }
  }, { sequelize, modelName: 'OrdenCompra', tableName: 'OrdenCompras' });

  return OrdenCompra;
};
