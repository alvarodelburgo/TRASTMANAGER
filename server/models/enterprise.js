const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Enterprise = tm_connection_db.define('enterprise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'username'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email'
  },
  cif: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'cif'
  },
  phone_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'phone_number'
  },
  bank_account: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'bank_account'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'role'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password',
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_image'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, { freezeTableName: true });

module.exports = Enterprise;