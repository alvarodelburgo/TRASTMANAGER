const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Premises = tm_connection_db.define('premises', {
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
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address'
  },
  capacity: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'capacity'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'description'
  },
  state: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'state'
  },
  premises_image: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'premises_image'
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

module.exports = Premises;