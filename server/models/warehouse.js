const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Warehouse = tm_connection_db.define('warehouse', {
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
    allowNull: true,
    field: 'premises_id'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tenant_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'name'
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'size'
  },
  rental_price: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    field: 'rental_price'
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'availability'
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'notes'
  },
  key: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'key'
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
  }, 
}, { freezeTableName: true });

module.exports = Warehouse;