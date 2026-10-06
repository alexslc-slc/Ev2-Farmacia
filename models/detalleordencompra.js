import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DetalleOrdenCompra extends Model {
    static associate(models) {
      DetalleOrdenCompra.belongsTo(models.OrdenCompra, { foreignKey: 'NroOrdenC' });
      DetalleOrdenCompra.belongsTo(models.Medicamento, { foreignKey: 'CodMedicamento' });
    }
  }

  DetalleOrdenCompra.init({
    idDetalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    NroOrdenC: { type: DataTypes.INTEGER, field: 'idOrdenCompra' },
    CodMedicamento: { type: DataTypes.INTEGER, field: 'idMedicamento' },
    descripcion: { type: DataTypes.STRING(180), allowNull: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 }, field: 'precioUnitario' },
    montouni: { type: DataTypes.DECIMAL(10, 2), allowNull: true, validate: { min: 0 } }
  }, { sequelize, modelName: 'DetalleOrdenCompra', tableName: 'DetalleOrdenCompras' });

  return DetalleOrdenCompra;
};
