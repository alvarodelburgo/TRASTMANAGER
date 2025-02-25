const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Tenant = tm_connection_db.define('tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  enterprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'enterprise_id'
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'owner_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'lastname'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email'
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'dni'
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


module.exports = Tenant;