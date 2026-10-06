import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Medicamento extends Model {
    static associate(models) {
      Medicamento.belongsTo(models.TipoMedic, { foreignKey: 'CodTipoMed' });
      Medicamento.belongsTo(models.Especialidad, { foreignKey: 'CodEspec' });
      Medicamento.belongsToMany(models.OrdenVenta, {
        through: models.DetalleOrdenVta,
        foreignKey: 'CodMedicamento',
        otherKey: 'NroOrdenVta'
      });
      Medicamento.belongsToMany(models.OrdenCompra, {
        through: models.DetalleOrdenCompra,
        foreignKey: 'CodMedicamento',
        otherKey: 'NroOrdenC'
      });
    }
  }

  Medicamento.init({
    CodMedicamento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'idMedicamento' },
    descripcionMed: { type: DataTypes.STRING(180), allowNull: false, field: 'nombre' },
    fechaFabricacion: { type: DataTypes.DATEONLY, allowNull: true },
    fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: true },
    Presentacion: { type: DataTypes.STRING(100), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    precioVentaUni: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 }, field: 'precio' },
    precioVentaPres: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    CodTipoMed: { type: DataTypes.INTEGER, allowNull: true },
    Marca: { type: DataTypes.STRING(100), allowNull: true },
    CodEspec: { type: DataTypes.INTEGER, allowNull: true }
  }, { sequelize, modelName: 'Medicamento', tableName: 'Medicamentos' });

  return Medicamento;
};
