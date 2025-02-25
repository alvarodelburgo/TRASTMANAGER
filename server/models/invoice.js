const { tm_connection_db } = require('../database');
const { DataTypes, TimeoutError } = require('sequelize');

const Invoice = tm_connection_db.define('invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'invoice_number'
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
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'warehouse_id'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tenant_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  issue_date : {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'issue_date'
  },
  due_date : {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'due_date'
  },
  payment_date : {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_date'
  },
  total_amount : {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'total_amount'
  },
  status  : {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
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

module.exports = Invoice;