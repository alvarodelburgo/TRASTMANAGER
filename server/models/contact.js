const { tm_connection_db } = require('../database');
const { DataTypes } = require('sequelize');

const Contact = tm_connection_db.define('contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id'
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    field: 'email'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    field: 'subject'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message'
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

module.exports = Contact;