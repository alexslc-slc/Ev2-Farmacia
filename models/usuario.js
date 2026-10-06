import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Usuario extends Model {}

  Usuario.init({
    idUsuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false },
    rol: {
      type: DataTypes.ENUM('admin', 'moderador', 'usuario'),
      allowNull: false,
      defaultValue: 'usuario'
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: { withPassword: { attributes: { include: ['passwordHash'] } } }
  });

  return Usuario;
};
