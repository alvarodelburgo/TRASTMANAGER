const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Rental = tm_connection_db.define('rental', {
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
  premises_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'premises_id'
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'warehouse_id'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tenant_id'
  },
  start_date: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'start_date'
  },
  finish_date: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'finish_date'
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'price'
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'state'
  },
  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'paid'
  },
  contract: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contract'
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

module.exports = Rental;