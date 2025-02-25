const { token_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const RefreshToken = token_connection_db.define('refresh_tokens', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'token'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, { freezeTableName: true });

module.exports = RefreshToken;